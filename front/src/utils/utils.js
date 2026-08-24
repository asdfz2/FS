import storage from './storage';
import menu from './menu';

/**
 * Legacy demo data stores absolute URLs from another Spring Boot context,
 * for example http://localhost:8080/springboot35l3z/upload/foo.jpg.
 * Normalize those to this project's /api/upload endpoint.
 */
export function resolveUploadUrl(value) {
    if (!value) return '';

    const raw = String(value).trim();
    if (raw.startsWith('/api/')) return raw;
    if (raw.toLowerCase().startsWith('/upload/')) return `/api${raw}`;
    if (!/^[a-z][a-z\d+\-.]*:/i.test(raw)) return `/api/upload/${raw}`;

    try {
        const { pathname } = new URL(raw, window.location.origin);
        const uploadIndex = pathname.toLowerCase().lastIndexOf('/upload/');
        if (uploadIndex !== -1) {
            return `/api${pathname.slice(uploadIndex)}`;
        }
    } catch (e) {
        return '';
    }

    return raw;
}

/**
 * 是否有权限
 * @param {*} key
 */
export function isAuth(tableName,key) {
    let role = storage.get("role");
    if(!role){
        role = '管理员';
    }
    let menus = menu.list();
    for(let i=0;i<menus.length;i++){
        if(menus[i].roleName==role){
            for(let j=0;j<menus[i].backMenu.length;j++){
                for(let k=0;k<menus[i].backMenu[j].child.length;k++){
                    if(tableName==menus[i].backMenu[j].child[k].tableName){
                        let buttons = menus[i].backMenu[j].child[k].buttons.join(',');
                        return buttons.indexOf(key) !== -1 || false
                    }
                }
            }
        }
    }
    // for(let i=0;i<menus.length;i++){
    //     if(menus[i].roleName==role){
    //         for(let j=0;j<menus[i].backMenu.length;j++){
    //             if(menus[i].backMenu[j].tableName==tableName){
    //                 let buttons = menus[i].backMenu[j].child[0].buttons.join(',');
    //                 return buttons.indexOf(key) !== -1 || false
    //             }
    //         }
    //     }
    // }
    return false;
}
