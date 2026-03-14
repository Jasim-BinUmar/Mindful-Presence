import React from 'react';
import { Text, View, Linking, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  body: { color: '#374151', fontSize: 16, lineHeight: 28, textAlign: 'justify' },
  bold: { fontWeight: '700' },
  italic: { fontStyle: 'italic' },
  boldItalic: { fontWeight: '700', fontStyle: 'italic' },
  code: { backgroundColor: '#F3F4F6', fontFamily: 'monospace', fontSize: 14, paddingHorizontal: 4, borderRadius: 4 },
  link: { color: '#623AD9', textDecorationLine: 'underline' },
  h1: { fontSize: 24, fontWeight: '700', color: '#111827', marginTop: 16, marginBottom: 8 },
  h2: { fontSize: 20, fontWeight: '700', color: '#1F2937', marginTop: 14, marginBottom: 6 },
  h3: { fontSize: 18, fontWeight: '600', color: '#374151', marginTop: 12, marginBottom: 4 },
  paragraph: { marginBottom: 12 },
  listItem: { flexDirection: 'row', marginBottom: 4, paddingLeft: 8 },
  listBullet: { color: '#374151', fontSize: 16, lineHeight: 28, marginRight: 8, width: 16 },
  listContent: { flex: 1, color: '#374151', fontSize: 16, lineHeight: 28, textAlign: 'justify' },
  blockquote: { backgroundColor: '#F3F4F6', borderLeftWidth: 4, borderLeftColor: '#623AD9', paddingLeft: 12, paddingVertical: 8, marginVertical: 8, borderRadius: 4 },
  codeBlock: { backgroundColor: '#F3F4F6', padding: 12, borderRadius: 8, marginVertical: 8 },
  codeBlockText: { fontFamily: 'monospace', fontSize: 14, color: '#374151' },
  hr: { borderBottomWidth: 1, borderBottomColor: '#D1D5DB', marginVertical: 12 },
});

function parseInline(text) {
  if (!text) return null;

  const parts = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    let earliest = remaining.length;
    let matchType = null;
    let match = null;

    const patterns = [
      { type: 'boldItalic', regex: /\*\*\*(.+?)\*\*\*/ },
      { type: 'bold', regex: /\*\*(.+?)\*\*/ },
      { type: 'italic', regex: /\*(.+?)\*/ },
      { type: 'code', regex: /`([^`]+)`/ },
      { type: 'link', regex: /\[([^\]]+)\]\(([^)]+)\)/ },
    ];

    for (const p of patterns) {
      const m = p.regex.exec(remaining);
      if (m && m.index < earliest) {
        earliest = m.index;
        matchType = p.type;
        match = m;
      }
    }

    if (!match) {
      parts.push(<Text key={key++}>{remaining}</Text>);
      break;
    }

    if (earliest > 0) {
      parts.push(<Text key={key++}>{remaining.slice(0, earliest)}</Text>);
    }

    if (matchType === 'boldItalic') {
      parts.push(<Text key={key++} style={styles.boldItalic}>{match[1]}</Text>);
    } else if (matchType === 'bold') {
      parts.push(<Text key={key++} style={styles.bold}>{match[1]}</Text>);
    } else if (matchType === 'italic') {
      parts.push(<Text key={key++} style={styles.italic}>{match[1]}</Text>);
    } else if (matchType === 'code') {
      parts.push(<Text key={key++} style={styles.code}>{match[1]}</Text>);
    } else if (matchType === 'link') {
      parts.push(
        <Text key={key++} style={styles.link} onPress={() => Linking.openURL(match[2])}>
          {match[1]}
        </Text>
      );
    }

    remaining = remaining.slice(earliest + match[0].length);
  }

  return parts;
}

function parseBlocks(source) {
  const lines = source.split('\n');
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === '') {
      i++;
      continue;
    }

    const headingMatch = line.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const style = level === 1 ? styles.h1 : level === 2 ? styles.h2 : styles.h3;
      blocks.push(
        <Text key={`h-${i}`} style={style}>{parseInline(headingMatch[2].trim())}</Text>
      );
      i++;
      continue;
    }

    if (line.match(/^---+$/) || line.match(/^\*\*\*+$/) || line.match(/^___+$/)) {
      blocks.push(<View key={`hr-${i}`} style={styles.hr} />);
      i++;
      continue;
    }

    if (line.trimStart().startsWith('```')) {
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].trimStart().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++;
      blocks.push(
        <View key={`code-${i}`} style={styles.codeBlock}>
          <Text style={styles.codeBlockText}>{codeLines.join('\n')}</Text>
        </View>
      );
      continue;
    }

    if (line.trimStart().startsWith('>')) {
      const quoteLines = [];
      while (i < lines.length && lines[i].trimStart().startsWith('>')) {
        quoteLines.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      blocks.push(
        <View key={`bq-${i}`} style={styles.blockquote}>
          <Text style={styles.body}>{parseInline(quoteLines.join(' '))}</Text>
        </View>
      );
      continue;
    }

    const ulMatch = line.match(/^(\s*)[-*+]\s+(.+)$/);
    if (ulMatch) {
      const items = [];
      while (i < lines.length) {
        const m = lines[i].match(/^(\s*)[-*+]\s+(.+)$/);
        if (!m) break;
        items.push(m[2]);
        i++;
      }
      items.forEach((item, idx) => {
        blocks.push(
          <View key={`ul-${i}-${idx}`} style={styles.listItem}>
            <Text style={styles.listBullet}>{'\u2022'}</Text>
            <Text style={styles.listContent}>{parseInline(item)}</Text>
          </View>
        );
      });
      continue;
    }

    const olMatch = line.match(/^(\s*)\d+[.)]\s+(.+)$/);
    if (olMatch) {
      const items = [];
      while (i < lines.length) {
        const m = lines[i].match(/^(\s*)\d+[.)]\s+(.+)$/);
        if (!m) break;
        items.push(m[2]);
        i++;
      }
      items.forEach((item, idx) => {
        blocks.push(
          <View key={`ol-${i}-${idx}`} style={styles.listItem}>
            <Text style={styles.listBullet}>{`${idx + 1}.`}</Text>
            <Text style={styles.listContent}>{parseInline(item)}</Text>
          </View>
        );
      });
      continue;
    }

    const paraLines = [];
    while (i < lines.length && lines[i].trim() !== '' && !lines[i].match(/^#{1,3}\s/) && !lines[i].match(/^[-*+]\s/) && !lines[i].match(/^\d+[.)]\s/) && !lines[i].trimStart().startsWith('>') && !lines[i].trimStart().startsWith('```') && !lines[i].match(/^---+$/) && !lines[i].match(/^\*\*\*+$/) && !lines[i].match(/^___+$/)) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      blocks.push(
        <View key={`p-${i}`} style={styles.paragraph}>
          <Text style={styles.body}>{parseInline(paraLines.join(' '))}</Text>
        </View>
      );
    }
  }

  return blocks;
}

function MarkdownText({ content, style: _style }) {
  const raw =
    content == null
      ? ''
      : Array.isArray(content)
        ? content.join('\n')
        : String(content);
  const source = raw.trim();
  if (!source) return null;

  return <View>{parseBlocks(source)}</View>;
}

export default MarkdownText;
