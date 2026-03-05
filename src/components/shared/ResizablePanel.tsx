import { useState, useRef, useEffect } from 'react';

export function ResizablePanel({ 
  children, 
  direction = 'vertical',
  initialSize = 200,
  minSize = 100,
  maxSize = 500,
  style = {}
}) {
  const [size, setSize] = useState(initialSize);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      
      let newSize;
      if (direction === 'vertical') {
        newSize = e.clientY - rect.top;
      } else {
        newSize = e.clientX - rect.left;
      }
      
      newSize = Math.max(minSize, Math.min(maxSize, newSize));
      setSize(newSize);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, direction, minSize, maxSize]);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsResizing(true);
    document.body.style.cursor = direction === 'vertical' ? 'row-resize' : 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const containerStyle = {
    ...style,
    display: 'flex',
    flexDirection: direction === 'vertical' ? 'column' : 'row',
    overflow: 'hidden',
    flex: style.flex || 1,
  };

  const contentStyle = {
    overflow: 'auto',
    [direction === 'vertical' ? 'height' : 'width']: size,
    flexShrink: 0,
  };

  const handleStyle = {
    [direction === 'vertical' ? 'height' : 'width']: '6px',
    [direction === 'vertical' ? 'cursor' : '']: 'row-resize',
    [direction === 'horizontal' ? 'cursor' : '']: 'col-resize',
    background: isResizing ? '#61afef' : 'transparent',
    transition: 'background 0.15s',
    flexShrink: 0,
    position: 'relative',
    ':hover': {
      background: '#61afef',
    },
  };

  return (
    <div ref={containerRef} style={containerStyle}>
      <div style={contentStyle}>{children}</div>
      <div 
        style={handleStyle}
        onMouseDown={handleMouseDown}
        onMouseEnter={(e) => e.target.style.background = '#3e4451'}
        onMouseLeave={(e) => !isResizing && (e.target.style.background = 'transparent')}
      />
    </div>
  );
}
