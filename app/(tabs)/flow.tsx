// Flow Screen — XState flow machine, interactive move graph, Tamagui UI
import React, { useRef } from 'react';
import { ScrollView, TouchableOpacity, PanResponder, Animated } from 'react-native';
import { YStack, XStack, Text } from 'tamagui';
import Svg, { Line, Circle, Text as SvgText, Defs, Marker, Path } from 'react-native-svg';
import { useMachines, useColors } from '../../lib/context/MachineContext';
import { FlowNode, FlowLink, FlowViewMode, selectNeighbors } from '../../lib/machines/flowMachine';
import { STATE_COLORS } from '../../lib/kernel/learningState';
import { Ionicons } from '@expo/vector-icons';

const VIEW_MODES: Array<{ label: string; mode: FlowViewMode; icon: any }> = [
  { label: 'Map', mode: 'map', icon: 'map-outline' },
  { label: 'Focus', mode: 'focus', icon: 'aperture-outline' },
  { label: 'Path', mode: 'path', icon: 'git-branch-outline' },
];

const NODE_R = 36;
const CANVAS_W = 700;
const CANVAS_H = 600;

function NodeCircle({ node, isSelected, onPress, c }: {
  node: FlowNode; isSelected: boolean; onPress: () => void; c: any;
}) {
  const color = STATE_COLORS[node.learningState as keyof typeof STATE_COLORS] ?? STATE_COLORS.NEW;
  return (
    <>
      <Circle
        cx={node.x}
        cy={node.y}
        r={isSelected ? NODE_R + 4 : NODE_R}
        fill={isSelected ? color : color + '33'}
        stroke={color}
        strokeWidth={isSelected ? 2.5 : 1.5}
        onPress={onPress}
      />
      <SvgText
        x={node.x}
        y={node.y}
        textAnchor="middle"
        alignmentBaseline="middle"
        fontSize={10}
        fontWeight="bold"
        fill={isSelected ? '#FFF' : color}
        onPress={onPress}
      >
        {node.moveName.length > 10 ? node.moveName.slice(0, 9) + '…' : node.moveName}
      </SvgText>
    </>
  );
}

function FlowGraph({ nodes, links, selectedNodeId, onSelectNode, c }: {
  nodes: FlowNode[];
  links: FlowLink[];
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
  c: any;
}) {
  const nodeById = new Map(nodes.map((n) => [n.moveId, n]));

  return (
    <Svg width={CANVAS_W} height={CANVAS_H}>
      {links.map((link) => {
        const from = nodeById.get(link.fromMoveId);
        const to = nodeById.get(link.toMoveId);
        if (!from || !to) return null;
        return (
          <Line
            key={link.id}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke={c.separator}
            strokeWidth={1.5}
            strokeOpacity={0.7}
          />
        );
      })}
      {nodes.map((node) => (
        <NodeCircle
          key={node.id}
          node={node}
          isSelected={selectedNodeId === node.id}
          onPress={() => onSelectNode(node.id)}
          c={c}
        />
      ))}
    </Svg>
  );
}

function FocusView({ nodes, links, focusNode, c }: {
  nodes: FlowNode[]; links: FlowLink[]; focusNode: FlowNode | null; c: any;
}) {
  if (!focusNode) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" gap={8}>
        <Text fontSize={15} color={c.secondary}>Select a node in Map view to focus</Text>
      </YStack>
    );
  }
  const neighborIds = new Set(
    links
      .filter((l) => l.fromMoveId === focusNode.moveId || l.toMoveId === focusNode.moveId)
      .flatMap((l) => [l.fromMoveId, l.toMoveId])
      .filter((id) => id !== focusNode.moveId)
  );
  const neighbors = nodes.filter((n) => neighborIds.has(n.moveId));

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
      <YStack padding={20} gap={12}>
        <YStack backgroundColor={c.surface} borderRadius={16} padding={16} borderWidth={2} borderColor={STATE_COLORS[focusNode.learningState as keyof typeof STATE_COLORS] ?? c.separator}>
          <Text fontSize={18} fontWeight="700" color={c.text}>{focusNode.moveName}</Text>
          {focusNode.category && <Text fontSize={13} color={c.secondary}>{focusNode.category}</Text>}
        </YStack>
        <Text fontSize={13} fontWeight="600" color={c.secondary} letterSpacing={0.5}>
          CONNECTIONS ({neighbors.length})
        </Text>
        {neighbors.map((n) => (
          <XStack key={n.id} backgroundColor={c.surface} borderRadius={12} padding={14} alignItems="center" gap={10}>
            <YStack width={10} height={10} borderRadius={5} backgroundColor={STATE_COLORS[n.learningState as keyof typeof STATE_COLORS] ?? c.separator} />
            <Text fontSize={14} color={c.text}>{n.moveName}</Text>
            {n.category && <Text fontSize={12} color={c.secondary}>{n.category}</Text>}
          </XStack>
        ))}
        {neighbors.length === 0 && <Text fontSize={13} color={c.secondary}>No connections yet. Link moves in Map view.</Text>}
      </YStack>
    </ScrollView>
  );
}

export default function FlowScreen() {
  const { flowSnap, flowActor, moveSnap } = useMachines();
  const c = useColors();
  const ctx = flowSnap.context;
  const selectedNode = ctx.nodes.find((n) => n.id === ctx.selectedNodeId) ?? null;

  return (
    <YStack flex={1} backgroundColor={c.background}>
      {/* Header */}
      <YStack paddingHorizontal={20} paddingTop={56} paddingBottom={12}>
        <XStack justifyContent="space-between" alignItems="center">
          <YStack>
            <Text fontSize={30} fontWeight="700" color={c.text} letterSpacing={-0.5}>Flow</Text>
            <Text fontSize={13} color={c.secondary} marginTop={2}>
              {ctx.nodes.length} moves · {ctx.links.length} connections
            </Text>
          </YStack>
          <XStack gap={6}>
            {selectedNode && ctx.viewMode === 'map' && (
              <TouchableOpacity
                onPress={() => {
                  const otherNode = ctx.nodes.find((n) => n.id !== ctx.selectedNodeId);
                  if (otherNode) {
                    flowActor({ type: 'ADD_LINK', fromMoveId: selectedNode.moveId, toMoveId: otherNode.moveId });
                  }
                }}
                activeOpacity={0.7}
              >
                <YStack backgroundColor={c.fill} borderRadius={20} paddingHorizontal={12} paddingVertical={8}>
                  <Ionicons name="git-branch-outline" size={16} color={c.accent} />
                </YStack>
              </TouchableOpacity>
            )}
          </XStack>
        </XStack>
      </YStack>

      {/* View mode segmented control */}
      <XStack paddingHorizontal={20} gap={0} marginBottom={12}>
        {VIEW_MODES.map(({ label, mode, icon }) => {
          const isActive = ctx.viewMode === mode;
          return (
            <TouchableOpacity
              key={mode}
              onPress={() => flowActor({ type: 'SET_VIEW_MODE', mode })}
              activeOpacity={0.7}
              style={{ flex: 1 }}
            >
              <YStack
                paddingVertical={8}
                alignItems="center"
                backgroundColor={isActive ? c.accent : c.fill}
                borderWidth={1}
                borderColor={c.separator}
                style={
                  mode === 'map' ? { borderTopLeftRadius: 10, borderBottomLeftRadius: 10 } :
                  mode === 'path' ? { borderTopRightRadius: 10, borderBottomRightRadius: 10 } : {}
                }
                gap={2}
              >
                <Ionicons name={icon} size={16} color={isActive ? '#FFF' : c.secondary} />
                <Text fontSize={11} fontWeight="600" color={isActive ? '#FFF' : c.secondary}>{label}</Text>
              </YStack>
            </TouchableOpacity>
          );
        })}
      </XStack>

      {/* Content */}
      {ctx.viewMode === 'map' && (
        <YStack flex={1}>
          {ctx.nodes.length === 0 ? (
            <YStack flex={1} alignItems="center" justifyContent="center" gap={12} padding={40}>
              <Ionicons name="git-branch-outline" size={56} color={c.secondary} />
              <Text fontSize={18} fontWeight="600" color={c.secondary}>No moves to map</Text>
              <Text fontSize={13} color={c.secondary} textAlign="center">
                Add moves in the Arsenal tab. They&apos;ll appear here automatically.
              </Text>
            </YStack>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <FlowGraph
                  nodes={ctx.nodes}
                  links={ctx.links}
                  selectedNodeId={ctx.selectedNodeId}
                  onSelectNode={(id) => {
                    if (ctx.selectedNodeId === id) {
                      flowActor({ type: 'DESELECT_NODE' });
                    } else {
                      flowActor({ type: 'SELECT_NODE', nodeId: id });
                    }
                  }}
                  c={c}
                />
              </ScrollView>
            </ScrollView>
          )}
          {selectedNode && (
            <YStack
              position="absolute"
              bottom={20}
              left={20}
              right={20}
              backgroundColor={c.surface}
              borderRadius={16}
              padding={16}
              shadowColor="#000"
              shadowOffset={{ width: 0, height: 4 } as any}
              shadowOpacity={0.12 as any}
              shadowRadius={12 as any}
              elevation={6}
            >
              <XStack justifyContent="space-between" alignItems="center">
                <YStack>
                  <Text fontSize={16} fontWeight="700" color={c.text}>{selectedNode.moveName}</Text>
                  <Text fontSize={12} color={c.secondary}>{selectedNode.category ?? 'Uncategorized'}</Text>
                </YStack>
                <TouchableOpacity onPress={() => flowActor({ type: 'DESELECT_NODE' })}>
                  <Ionicons name="close-circle" size={22} color={c.secondary} />
                </TouchableOpacity>
              </XStack>
            </YStack>
          )}
        </YStack>
      )}

      {ctx.viewMode === 'focus' && (
        <FocusView nodes={ctx.nodes} links={ctx.links} focusNode={selectedNode} c={c} />
      )}

      {ctx.viewMode === 'path' && (
        <YStack flex={1} alignItems="center" justifyContent="center" gap={12} padding={40}>
          <Ionicons name="git-branch" size={48} color={c.secondary} />
          <Text fontSize={18} fontWeight="600" color={c.secondary}>Path Finder</Text>
          <Text fontSize={13} color={c.secondary} textAlign="center">
            Select two moves in Map view to find the shortest path between them.
          </Text>
        </YStack>
      )}
    </YStack>
  );
}
