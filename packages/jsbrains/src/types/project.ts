export interface RecentProjectInfo {
   name: string | null;
   path: string;
   exists: boolean;
   lastOpened?: Date;
}
