import bus from "@/utils/bus";

// 兼容旧的 $on/$emit 调用
bus.$on = bus.on;
bus.$emit = bus.emit;
bus.$off = bus.off;

export default bus;
