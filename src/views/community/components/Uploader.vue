<template>
    <div>
        <el-upload
            :action="url"
            ref="upload"
            list-type="picture-card"
            :headers="headers"
            :on-preview="handlePictureCardPreview"
            :auto-upload="false"
            :file-list="fileList"
            :limit="maxCount"
            :accept="acceptedExtensions.reduce((acc, cur) => acc + `.${cur},`, '')"
            multiple
            with-credentials
            :on-exceed="onExceed"
            :on-change="onChange"
            :on-success="onSuccess"
            :on-error="onError"
        >
            <i class="el-icon-plus"></i>
            <template #tip>
                <div class="el-upload__tip">
                    {{
                        $t("pages.community.uploader.tip", {
                            count: maxCount,
                            formats: acceptedExtensions.join(" / ").toUpperCase(),
                            size: maxSize / 1024 / 1024,
                        })
                    }}
                </div>
            </template>
        </el-upload>
        <el-dialog v-model="dialogVisible">
            <img width="60%" :src="dialogImageUrl" :alt="$t('pages.community.uploader.previewAlt')" />
        </el-dialog>
    </div>
</template>

<script>
import { __cms } from "@/utils/config";
const API_Root = process.env.NODE_ENV === "production" ? __cms : __cms;
const API = API_Root + "api/cms/upload";
export default {
    data() {
        return {
            url: API,
            dialogImageUrl: "",
            dialogVisible: false,
            fileList: [],
            successList: [],
            activeUploadUids: [],
            successfulUploadUids: [],
            acceptedExtensions: ["jpg", "jpeg", "png", "gif"],
            maxCount: 5,
            maxSize: 10 * 1024 * 1024,
        };
    },
    computed: {
        headers() {
            const token = localStorage.getItem("token") || "";
            const credentials = btoa(`${token}:cms common request`);
            return {
                Authorization: `Basic ${credentials}`,
            };
        },
    },
    methods: {
        handlePictureCardPreview(file) {
            this.dialogImageUrl = file.url;
            this.dialogVisible = true;
        },
        onExceed() {
            this.$notify({
                title: "",
                message: this.$t("pages.community.uploader.maxCountExceeded", { count: this.maxCount }),
                type: "error",
                duration: 3000,
                position: "bottom-right",
            });
        },
        onChange(file, fileList) {
            if (file.status == "ready") {
                if (file.size > this.maxSize) {
                    this.$notify({
                        title: "",
                        message: this.$t("pages.community.uploader.maxSizeExceeded", {
                            size: this.maxSize / 1024 / 1024,
                        }),
                        type: "error",
                        duration: 3000,
                        position: "bottom-right",
                    });
                    fileList.pop();
                } else {
                    this.fileList = fileList;
                }
            }
        },
        upload() {
            if (this.fileList.length > 0) {
                this.successList = [];
                this.successfulUploadUids = [];
                this.activeUploadUids = this.fileList.map((file) => file.uid);
                this.$refs.upload.submit();
            } else {
                this.$emit("onFinish", []);
            }
        },
        onSuccess(response, file) {
            if (!file || !this.activeUploadUids.includes(file.uid)) return;
            if (response.code === 0) {
                if (this.successfulUploadUids.includes(file.uid)) return;
                this.successfulUploadUids.push(file.uid);
                this.successList = this.successList.concat(response.data || []);
                if (this.successfulUploadUids.length === this.activeUploadUids.length) {
                    this.$emit("onFinish", this.successList || []);
                    this.fileList = [];
                    this.successList = [];
                    this.activeUploadUids = [];
                    this.successfulUploadUids = [];
                }
            } else {
                this.onError(response.msg, file);
            }
        },
        onError(error, file) {
            if (file && !this.activeUploadUids.includes(file.uid)) return;
            const message = typeof error === "string" ? error : error?.message;
            this.$notify({
                title: "",
                message: message || this.$t("pages.community.uploader.uploadFailed"),
                type: "error",
                duration: 3000,
                position: "bottom-right",
            });
            this.$emit("onError");
            this.fileList = [];
            this.successList = [];
            this.activeUploadUids = [];
            this.successfulUploadUids = [];
        },
        addFile(file) {
            this.$refs.upload.handleStart(file);
            return false;
        },
    },
};
</script>
