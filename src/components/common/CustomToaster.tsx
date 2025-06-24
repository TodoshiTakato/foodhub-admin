import React from 'react';
import toast, { Toaster, ToastBar } from 'react-hot-toast';

const CustomToaster: React.FC = () => {
  return (
    <Toaster 
      position="top-right"
      toastOptions={{
        duration: 6000,
      }}
    >
      {(t) => (
        <ToastBar 
          toast={t}
          style={{
            background: '#363636',
            color: '#fff'
          }}
        >
          {({ icon, message }) => (
            <>
              {icon}
              {message}
              {t.type !== 'loading' && (
                <button 
                  onClick={() => toast.dismiss(t.id)}
                  style={{ 
                    marginLeft: '8px', 
                    background: 'rgba(255,255,255,0.2)', 
                    border: 'none', 
                    borderRadius: '4px', 
                    color: 'inherit', 
                    padding: '4px 8px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  ✕
                </button>
              )}
            </>
          )}
        </ToastBar>
      )}
    </Toaster>
  );
};

export default CustomToaster; 