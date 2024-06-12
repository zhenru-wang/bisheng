from datetime import datetime
from typing import List

from bisheng.api.services.user_service import UserPayload
from bisheng.database.models.group import Group, GroupCreate, GroupDao, GroupRead
from bisheng.database.models.group_resource import GroupResourceDao, ResourceTypeEnum
from bisheng.database.models.user import User, UserDao
from bisheng.database.models.user_group import UserGroupCreate, UserGroupDao, UserGroupRead
from loguru import logger


class RoleGroupService():

    def get_group_list(self, group_ids: List[int]) -> List[GroupRead]:
        """获取全量的group列表"""

        # 查询group
        if group_ids:
            groups = GroupDao.get_group_by_ids(group_ids)
        else:
            groups = GroupDao.get_all_group()
        # 查询user
        user_admin = UserGroupDao.get_groups_admins([group.id for group in groups])
        users_dict = {}
        if user_admin:
            user_ids = [user.user_id for user in user_admin]
            users = UserDao.get_user_by_ids(user_ids)
            users_dict = {user.user_id: user for user in users}

        groupReads = [GroupRead.validate(group) for group in groups]
        for group in groupReads:
            group.group_admins = [
                users_dict.get(user.user_id).model_dump() for user in user_admin
                if user.group_id == group.id
            ]
        return groupReads

    def create_group(self, login_user: UserPayload, group: GroupCreate) -> Group:
        """新建用户组"""
        group_admin = group.group_admins
        group.create_user = login_user.user_id
        group.update_user = login_user.user_id
        group = GroupDao.insert_group(group)
        if group_admin:
            logger.info('set_admin group_admins={}', group_admin)
            self.set_group_admin(group_admin, group.id)
        return group

    def update_group(self, login_user: UserPayload, group: Group) -> Group:
        """更新用户组"""
        exist_group = GroupDao.get_user_group(group.id)
        if not exist_group:
            raise ValueError('用户组不存在')
        exist_group.group_name = group.group_name
        exist_group.remark = group.group_name
        exist_group.update_user = login_user.user_id
        exist_group.update_time = datetime.now()

        group = GroupDao.update_group(exist_group)
        return group

    def delete_group(self, group_id: int):
        """删除用户组"""

        GroupDao.delete_group(group_id)

    def get_group_user_list(self, group_id: int, page_size: int, page_num: int) -> List[User]:
        """获取全量的group列表"""

        # 查询user
        user_group_list = UserGroupDao.get_group_user(group_id, page_size, page_num)
        if user_group_list:
            user_ids = [user.user_id for user in user_group_list]
            return UserDao.get_user_by_ids(user_ids)

        return None

    def insert_user_group(self, user_group: UserGroupCreate) -> UserGroupRead:
        """插入用户组"""

        user_groups = UserGroupDao.get_user_group(user_group.user_id)
        if user_groups and user_group.group_id in [ug.group_id for ug in user_groups]:
            raise ValueError('重复设置用户组')

        return UserGroupDao.insert_user_group(user_group)

    def replace_user_groups(self, login_user: UserPayload, user_id: int, group_ids: List[int]):
        """ 覆盖用户的所在的用户组 """
        UserGroupDao.replace_user_groups(user_id, group_ids)
        return None

    def get_user_groups_list(self, user_id: int) -> List[GroupRead]:
        """获取用户组列表"""
        user_groups = UserGroupDao.get_user_group(user_id)
        if not user_groups:
            return []
        group_ids = [ug.group_id for ug in user_groups]
        return GroupDao.get_group_by_ids(group_ids)

    def set_group_admin(self, login_user: UserPayload, user_ids: List[int], group_id: int):
        """设置用户组管理员"""
        # 获取目前用户组的管理员列表
        user_group_admins = UserGroupDao.get_groups_admins([group_id])
        res = []
        need_delete_admin = []
        need_add_admin = user_ids
        if user_group_admins:
            for user in user_group_admins:
                if user.user_id in need_add_admin:
                    res.append(user)
                    need_add_admin.remove(user.user_id)
                else:
                    need_delete_admin.append(user.user_id)
        if need_add_admin:
            # 可以分配非组内用户为管理员。进行用户创建
            for user_id in need_add_admin:
                res.append(
                    self.insert_user_group(
                        UserGroupCreate(user_id=user_id, group_id=group_id, is_group_admin=True)))
        if need_delete_admin:
            UserGroupDao.delete_group_admins(group_id, need_delete_admin)
        # 修改用户组的最近修改人
        GroupDao.update_group_update_user(group_id, login_user.user_id)
        return res

    def set_group_update_user(self, login_user: UserPayload, group_id: int):
        """设置用户组管理员"""
        GroupDao.update_group_update_user(group_id, login_user.user_id)

    def get_group_resources(self, group_id: int, resource_type: ResourceTypeEnum, name: str,
                            page_size: int, page_num: int):
        """设置用户组管理员"""
        return GroupResourceDao.get_group_resource(group_id, resource_type, name, page_size,
                                                   page_num)
