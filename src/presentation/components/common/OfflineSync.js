import { useEffect } from 'react';
import { getUnsyncedActions, markActionSynced } from '../../../data-access/db/dexieDb';
import { taskApi } from '../../../data-access/api/taskApi';
import { materialApi } from '../../../data-access/api/materialApi';
import { TASK_STATUS } from '../../../data-access/types';
import useUIStore from '../../../state/uiStore';

const OfflineSync = () => {
  const isOnline = useUIStore((s) => s.isOnline);
  const setOnline = useUIStore((s) => s.setOnline);
  const showNotification = useUIStore((s) => s.showNotification);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOnline]);

  useEffect(() => {
    if (!isOnline) return;

    const sync = async () => {
      try {
        const actions = await getUnsyncedActions();
        if (!actions.length) return;

        showNotification(`Синхронизация ${actions.length} изменений...`, 'info');

        for (const action of actions) {
          try {
            switch (action.type) {
              case 'TRANSITION_STATUS':
                await taskApi.transitionStatus(action.entityId, action.payload);
                break;
              case 'COMPLETE_TASK':
                await taskApi.transitionStatus(action.entityId, {
                  to: TASK_STATUS.COMPLETED,
                  comment: action.payload.comment,
                });
                break;
              case 'UPLOAD_PHOTO':
                await taskApi.uploadPhoto(action.entityId, action.payload.photos);
                break;
              case 'CREATE_MATERIAL_REQUEST':
                await materialApi.create(action.payload);
                break;
              default:
                break;
            }
            await markActionSynced(action.id);
          } catch (err) {
            console.error('Sync failed for action', action.id, err);
          }
        }

        showNotification('Синхронизация завершена', 'success');
      } catch {
        // Dexie not available or offline DB error - skip silently
      }
    };

    sync().catch(() => {});
  }, [isOnline, showNotification]);

  return null;
};

export default OfflineSync;
