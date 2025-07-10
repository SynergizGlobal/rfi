import React, { useLayoutEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';

const DropdownPortal = ({ targetRef, children, onClose }) => {
  const portalRef = useRef(null);
  const [position, setPosition] = useState(null);

  useLayoutEffect(() => {
    if (targetRef) {
      const rect = targetRef.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 280,  // small space below button
        right: rect.right + window.scrollX + 50 ,
      });
    }
  }, [targetRef]);

  useLayoutEffect(() => {
    const handleClickOutside = (event) => {
      const portalNode = portalRef.current;
      const triggerNode = targetRef;

      if (
        portalNode &&
        !portalNode.contains(event.target) &&
        triggerNode &&
        !triggerNode.contains(event.target)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [targetRef, onClose]);

  if (!position) return null;

  return ReactDOM.createPortal(
    <div
      ref={portalRef}
      className="inspection-dropdown"
      style={{
        position: 'absolute',
        top: `${position.top}px`,
        right: `${position.right}px`,
        zIndex: 9999,
        background: 'white',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        padding: '8px',
        borderRadius: '4px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {children}
    </div>,
    document.body
  );
};

export default DropdownPortal;
