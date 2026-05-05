// Lab Screen — XState lab machine, kanban board, quick log, Tamagui UI
import React, { useRef } from 'react';
import { ScrollView, TouchableOpacity, Alert, TextInput, Animated } from 'react-native';
import { YStack, XStack, Text } from 'tamagui';
import { useMachines, useBoardColumns, useColors } from '../../lib/context/MachineContext';
import {
  Lab, LabStatus, LabViewMode, LabType,
  LAB_STATUS_LABELS, LAB_STATUS_COLORS,
} from '../../lib/machines/labMachine';
import { Ionicons } from '@expo/vector-icons';

const STATUS_ORDER: LabStatus[] = ['idea', 'attempting', 'landed', 'clean'];

function LabCard({ lab, onPress, onStatusChange, onDelete, c }: {
  lab: Lab; onPress: () => void;
  onStatusChange: (status: LabStatus) => void;
  onDelete: () => void;
  c: any;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const nextStatus = STATUS_ORDER[STATUS_ORDER.indexOf(lab.status) + 1] as LabStatus | undefined;

  return (
    <TouchableOpacity onPress={onPress} onLongPress={onDelete} activeOpacity={0.85}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <YStack
          backgroundColor={c.surface}
          borderRadius={14}
          padding={16}
          marginBottom={10}
          borderLeftWidth={3}
          borderLeftColor={LAB_STATUS_COLORS[lab.status]}
          shadowColor="#000"
          shadowOffset={{ width: 0, height: 2 } as any}
          shadowOpacity={0.06 as any}
          shadowRadius={6 as any}
          elevation={2}
        >
          <XStack justifyContent="space-between" alignItems="flex-start">
            <Text fontSize={15} fontWeight="600" color={c.text} flex={1} marginRight={8}>{lab.name}</Text>
            <YStack
              backgroundColor={LAB_STATUS_COLORS[lab.status] + '22'}
              paddingHorizontal={8}
              paddingVertical={3}
              borderRadius={10}
            >
              <Text fontSize={11} fontWeight="700" color={LAB_STATUS_COLORS[lab.status]}>
                {LAB_STATUS_LABELS[lab.status]}
              </Text>
            </YStack>
          </XStack>
          {lab.notes && <Text fontSize={13} color={c.secondary} marginTop={6} lineHeight={18}>{lab.notes}</Text>}
          {nextStatus && (
            <TouchableOpacity onPress={() => onStatusChange(nextStatus)} activeOpacity={0.7}>
              <XStack marginTop={10} alignItems="center" gap={4}>
                <Ionicons name="arrow-forward-circle-outline" size={14} color={c.accent} />
                <Text fontSize={12} color={c.accent} fontWeight="600">
                  Move to {LAB_STATUS_LABELS[nextStatus]}
                </Text>
              </XStack>
            </TouchableOpacity>
          )}
        </YStack>
      </Animated.View>
    </TouchableOpacity>
  );
}

function BoardView({ c }: { c: any }) {
  const { labActor } = useMachines();
  const columns = useBoardColumns();

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
      <XStack padding={20} gap={12} alignItems="flex-start">
        {STATUS_ORDER.map((status) => (
          <YStack key={status} width={260}>
            <XStack alignItems="center" gap={8} marginBottom={12}>
              <YStack width={8} height={8} borderRadius={4} backgroundColor={LAB_STATUS_COLORS[status]} />
              <Text fontSize={13} fontWeight="700" color={c.text} letterSpacing={0.5}>
                {LAB_STATUS_LABELS[status].toUpperCase()}
              </Text>
              <Text fontSize={12} color={c.secondary}>({columns[status].length})</Text>
            </XStack>
            {columns[status].map((lab) => (
              <LabCard
                key={lab.id}
                lab={lab}
                c={c}
                onPress={() => {}}
                onStatusChange={(s) => labActor({ type: 'SET_STATUS', id: lab.id, status: s })}
                onDelete={() => Alert.alert('Delete Lab', `Delete "${lab.name}"?`, [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', onPress: () => labActor({ type: 'DELETE_LAB', id: lab.id }), style: 'destructive' },
                ])}
              />
            ))}
            {columns[status].length === 0 && (
              <YStack
                borderWidth={1}
                borderColor={c.separator}
                borderStyle="dashed"
                borderRadius={12}
                padding={20}
                alignItems="center"
              >
                <Text fontSize={13} color={c.secondary}>Empty</Text>
              </YStack>
            )}
          </YStack>
        ))}
      </XStack>
    </ScrollView>
  );
}

function ListView({ labs, c }: { labs: Lab[]; c: any }) {
  const { labActor } = useMachines();
  return (
    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
      <YStack padding={20} gap={0}>
        {labs.filter((l) => l.type === 'project').map((lab) => (
          <LabCard
            key={lab.id}
            lab={lab}
            c={c}
            onPress={() => {}}
            onStatusChange={(s) => labActor({ type: 'SET_STATUS', id: lab.id, status: s })}
            onDelete={() => Alert.alert('Delete Lab', `Delete "${lab.name}"?`, [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', onPress: () => labActor({ type: 'DELETE_LAB', id: lab.id }), style: 'destructive' },
            ])}
          />
        ))}
        {labs.filter((l) => l.type === 'project').length === 0 && (
          <YStack alignItems="center" paddingTop={60} gap={8}>
            <Ionicons name="flask-outline" size={48} color={c.secondary} />
            <Text fontSize={16} fontWeight="600" color={c.secondary}>No projects yet</Text>
            <Text fontSize={13} color={c.secondary}>Use the quick log to capture ideas</Text>
          </YStack>
        )}
      </YStack>
    </ScrollView>
  );
}

const VIEW_MODES: Array<{ label: string; mode: LabViewMode }> = [
  { label: 'Projects', mode: 'projects' },
  { label: 'Board', mode: 'board' },
  { label: 'Sets', mode: 'sets' },
];

export default function LabScreen() {
  const { labSnap, labActor } = useMachines();
  const c = useColors();
  const ctx = labSnap.context;

  const showCreateLab = () => {
    Alert.prompt(
      'New Training Project',
      'What are you working on?',
      (name) => {
        if (name?.trim()) {
          labActor({ type: 'CREATE_LAB', name: name.trim(), type: 'project' });
        }
      },
      'plain-text',
      '',
    );
  };

  const handleQuickLog = () => {
    if (!ctx.quickLogText.trim()) return;
    labActor({ type: 'SUBMIT_QUICK_LOG' });
  };

  return (
    <YStack flex={1} backgroundColor={c.background}>
      {/* Header */}
      <YStack paddingHorizontal={20} paddingTop={56} paddingBottom={12}>
        <XStack justifyContent="space-between" alignItems="center">
          <YStack>
            <Text fontSize={30} fontWeight="700" color={c.text} letterSpacing={-0.5}>Lab</Text>
            <Text fontSize={13} color={c.secondary} marginTop={2}>{ctx.labs.length} projects</Text>
          </YStack>
          <TouchableOpacity onPress={showCreateLab} activeOpacity={0.7}>
            <YStack
              backgroundColor={c.accent}
              borderRadius={20}
              paddingHorizontal={14}
              paddingVertical={8}
            >
              <Text fontSize={13} fontWeight="700" color="#FFF">+ New</Text>
            </YStack>
          </TouchableOpacity>
        </XStack>
      </YStack>

      {/* Quick log */}
      <YStack marginHorizontal={20} marginBottom={16}>
        <XStack
          backgroundColor={c.fill}
          borderRadius={12}
          paddingHorizontal={14}
          paddingVertical={10}
          alignItems="center"
          gap={10}
        >
          <Ionicons name="pencil-outline" size={16} color={c.secondary} />
          <TextInput
            style={{ flex: 1, fontSize: 14, color: c.text }}
            placeholder="Quick log — capture an idea..."
            placeholderTextColor={c.secondary}
            value={ctx.quickLogText}
            onChangeText={(t) => labActor({ type: 'SET_QUICK_LOG', text: t })}
            onSubmitEditing={handleQuickLog}
            returnKeyType="done"
          />
          {ctx.quickLogText.trim().length > 0 && (
            <TouchableOpacity onPress={handleQuickLog}>
              <Ionicons name="send" size={16} color={c.accent} />
            </TouchableOpacity>
          )}
        </XStack>
      </YStack>

      {/* Recent quick entries */}
      {ctx.entries.length > 0 && (
        <YStack marginHorizontal={20} marginBottom={12}>
          <Text fontSize={12} fontWeight="600" color={c.secondary} marginBottom={6} letterSpacing={0.5}>
            RECENT LOGS
          </Text>
          {ctx.entries.slice(0, 3).map((e) => (
            <XStack key={e.id} paddingVertical={6} borderBottomWidth={1} borderBottomColor={c.separator} gap={8} alignItems="center">
              <YStack width={4} height={4} borderRadius={2} backgroundColor={c.accent} />
              <Text fontSize={13} color={c.text} flex={1}>{e.content}</Text>
            </XStack>
          ))}
        </YStack>
      )}

      {/* View mode segmented control */}
      <XStack paddingHorizontal={20} gap={0} marginBottom={12}>
        {VIEW_MODES.map(({ label, mode }) => {
          const isActive = ctx.viewMode === mode;
          return (
            <TouchableOpacity
              key={mode}
              onPress={() => labActor({ type: 'SET_VIEW_MODE', mode })}
              activeOpacity={0.7}
              style={{ flex: 1 }}
            >
              <YStack
                paddingVertical={8}
                alignItems="center"
                borderRadius={0}
                backgroundColor={isActive ? c.accent : c.fill}
                borderWidth={1}
                borderColor={c.separator}
                style={
                  mode === 'projects' ? { borderTopLeftRadius: 10, borderBottomLeftRadius: 10 } :
                  mode === 'sets' ? { borderTopRightRadius: 10, borderBottomRightRadius: 10 } : {}
                }
              >
                <Text fontSize={13} fontWeight="600" color={isActive ? '#FFF' : c.secondary}>{label}</Text>
              </YStack>
            </TouchableOpacity>
          );
        })}
      </XStack>

      {/* Content */}
      {ctx.viewMode === 'board' ? (
        <BoardView c={c} />
      ) : (
        <ListView labs={ctx.labs} c={c} />
      )}
    </YStack>
  );
}
