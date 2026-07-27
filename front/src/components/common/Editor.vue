<template>
  <div>
    <el-upload
      class="avatar-uploader"
      :action="getActionUrl"
      name="file"
      :headers="header"
      :show-file-list="false"
      :on-success="uploadSuccess"
      :on-error="uploadError"
      :before-upload="beforeUpload"
    ></el-upload>

    <div class="editor" ref="editorContainer"></div>
  </div>
</template>

<script>
import Quill from "quill";
import "quill/dist/quill.core.css";
import "quill/dist/quill.snow.css";
import "quill/dist/quill.bubble.css";

const toolbarOptions = [
  ["bold", "italic", "underline", "strike"],
  ["blockquote", "code-block"],
  [{ header: 1 }, { header: 2 }],
  [{ list: "ordered" }, { list: "bullet" }],
  [{ script: "sub" }, { script: "super" }],
  [{ indent: "-1" }, { indent: "+1" }],
  [{ size: ["small", false, "large", "huge"] }],
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ color: [] }, { background: [] }],
  [{ font: [] }],
  [{ align: [] }],
  ["clean"],
  ["link", "image", "video"]
];

export default {
  name: "Editor",
  props: {
    modelValue: { type: String, default: "" },
    value: { type: String, default: "" },
    action: { type: String },
    maxSize: { type: Number, default: 4000 }
  },
  emits: ["update:modelValue", "input", "change"],
  data() {
    return {
      quillInstance: null,
      quillUpdateImg: false,
      header: {}
    };
  },
  computed: {
    getActionUrl() {
      return `/${this.$base.name}/` + this.action;
    },
    contentValue() {
      return this.modelValue || this.value || "";
    }
  },
  watch: {
    contentValue(val) {
      if (this.quillInstance && val !== this.quillInstance.root.innerHTML) {
        this.quillInstance.root.innerHTML = val;
      }
    }
  },
  mounted() {
    this.header = { Token: this.$storage.get("Token") };
    this.initQuill();
  },
  beforeUnmount() {
    this.quillInstance = null;
  },
  methods: {
    initQuill() {
      const vm = this;
      vm.quillInstance = new Quill(vm.$refs.editorContainer, {
        placeholder: "",
        theme: "snow",
        modules: {
          toolbar: {
            container: toolbarOptions,
            handlers: {
              image() {
                document.querySelector(".avatar-uploader input").click();
              }
            }
          }
        }
      });
      vm.quillInstance.root.innerHTML = vm.contentValue;
      vm.quillInstance.on("text-change", function () {
        var html = vm.quillInstance.root.innerHTML;
        vm.$emit("update:modelValue", html);
        vm.$emit("input", html);
        vm.$emit("change", html);
      });
    },
    beforeUpload() {
      this.quillUpdateImg = true;
    },
    uploadSuccess(res) {
      if (res.code === 0) {
        var quill = this.quillInstance;
        var length = quill.getSelection().index;
        quill.insertEmbed(length, "image", this.$base.url + "upload/" + res.file);
        quill.setSelection(length + 1);
      } else {
        this.$message.error("图片插入失败");
      }
      this.quillUpdateImg = false;
    },
    uploadError() {
      this.quillUpdateImg = false;
      this.$message.error("图片插入失败");
    }
  }
};
</script>

<style>
.editor {
  line-height: normal !important;
  height: 400px;
}
.ql-snow .ql-tooltip[data-mode="link"]::before {
  content: "请输入链接地址:";
}
.ql-snow .ql-tooltip.ql-editing a.ql-action::after {
  border-right: 0px;
  content: "保存";
  padding-right: 0px;
}
.ql-snow .ql-tooltip[data-mode="video"]::before {
  content: "请输入视频地址:";
}
.ql-snow .ql-picker.ql-size .ql-picker-label::before,
.ql-snow .ql-picker.ql-size .ql-picker-item::before {
  content: "14px";
}
.ql-snow .ql-picker.ql-size .ql-picker-label[data-value="small"]::before,
.ql-snow .ql-picker.ql-size .ql-picker-item[data-value="small"]::before {
  content: "10px";
}
.ql-snow .ql-picker.ql-size .ql-picker-label[data-value="large"]::before,
.ql-snow .ql-picker.ql-size .ql-picker-item[data-value="large"]::before {
  content: "18px";
}
.ql-snow .ql-picker.ql-size .ql-picker-label[data-value="huge"]::before,
.ql-snow .ql-picker.ql-size .ql-picker-item[data-value="huge"]::before {
  content: "32px";
}
.ql-snow .ql-picker.ql-header .ql-picker-label::before,
.ql-snow .ql-picker.ql-header .ql-picker-item::before {
  content: "文本";
}
/* ... more styles preserved from original ... */
</style>
