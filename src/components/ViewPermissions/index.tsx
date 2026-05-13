'use client';

import { ListItem } from '@worldcoin/mini-apps-ui-kit-react';
import { MiniKit } from '@worldcoin/minikit-js';
import { useMiniKit } from '@worldcoin/minikit-js/minikit-provider';
import { permissionLabelZh } from '@/lib/permission-labels';
import { useEffect, useState } from 'react';
/**
 * This component is an example of how to view the permissions of a user
 * It's critical you use Minikit commands on client components
 * Read More: https://docs.world.org/mini-apps/commands/permissions
 */

export const ViewPermissions = () => {
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const { isInstalled } = useMiniKit();

  useEffect(() => {
    const fetchPermissions = async () => {
      if (isInstalled) {
        try {
          // You can also fetch this by grabbing from user
          // MiniKit.user.permissions
          const result = await MiniKit.getPermissions();
          if (result.data.status !== 'success') {
          console.log('查無使用者權限');
            return;
          }
          setPermissions(result.data.permissions || {});
          console.log('permissions', result);
        } catch (error) {
          console.error('取得權限失敗:', error);
        }
      } else {
        console.log('非 World App 環境，MiniKit 未安裝');
      }
    };
    fetchPermissions();
  }, [isInstalled]);

  return (
    <div className="grid w-full gap-4">
      <p className="text-lg font-semibold">已授權項目</p>
      <p className="text-sm text-gray-500">
        以下為此 Mini App 在 World App 中已取得的使用者授權。
      </p>
      {permissions &&
        Object.entries(permissions).map(([permission, value]) => (
          <ListItem
            key={permission}
            description={value ? '已開啟' : '已關閉'}
            label={permissionLabelZh(permission)}
          />
        ))}
    </div>
  );
};
