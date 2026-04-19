import { Highlight, themes } from 'prism-react-renderer';

interface CodeBlockProps {
  code: string;
  language?: string;
  highlightLines?: number[];
}

export function CodeBlock({ code, language = 'sql', highlightLines = [] }: CodeBlockProps) {
  return (
    <Highlight theme={themes.nightOwlLight} code={code.trim()} language={language}>
      {({ style, tokens, getLineProps, getTokenProps }) => (
        <pre
          className="prism-code overflow-auto"
          style={{
            ...style,
            background: 'var(--surface-2)',
            margin: 0,
          }}
        >
          {tokens.map((line, i) => {
            const lineProps = getLineProps({ line });
            const isHighlighted = highlightLines.includes(i + 1);
            return (
              <div
                key={i}
                {...lineProps}
                style={{
                  ...lineProps.style,
                  background: isHighlighted ? 'var(--accent-subtle)' : undefined,
                  padding: isHighlighted ? '0 4px' : undefined,
                  borderRadius: isHighlighted ? '3px' : undefined,
                }}
              >
                <span className="text-text-tertiary text-[11px] inline-block w-6 text-right mr-4 select-none">
                  {i + 1}
                </span>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </div>
            );
          })}
        </pre>
      )}
    </Highlight>
  );
}
