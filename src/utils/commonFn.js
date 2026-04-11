import colorData from "@jx3box/jx3box-data/data/xf/colors";
import mount_equip from "@jx3box/jx3box-data/data/xf/mount_equip.json";

const mountColor = (mount) => {
    const _mount = mount_equip[mount];
    if (!_mount) return "";
    return colorData.colors_by_mount_name[_mount.name];
};

export { mountColor };
