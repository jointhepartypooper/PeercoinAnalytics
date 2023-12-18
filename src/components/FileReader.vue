<script setup lang="ts">
import { computed, ref, type PropType } from "vue";
import { BIconCloudUpload } from "bootstrap-icons-vue";

const emit = defineEmits(["text-loaded"]);

const fileObject = ref<File | null>(null);
const file = ref<any>(null);
const fileName = computed<string>(() =>
  !!fileObject.value && !!fileObject.value.name ? fileObject.value.name : ""
);
const hasJsonChosen = computed<boolean>(() => {
  return fileName.value.endsWith(".json");
});
function loadTextFromFile(ev: any): void {
  if (!ev.target || !ev.target.files) return;
  fileObject.value = file.value.files[0];
}

function readFile() {
  if (!hasJsonChosen.value) {
    return;
  }
  const reader = new FileReader();

  reader.onload = (e) => {
    if (!!e.target) emit("text-loaded", e.target.result);
  };
  reader.readAsText(fileObject!.value!);
}
</script>

<template>
  <div class="input-group custom-file-button">
    <label class="input-group-text inputbox clickable" for="inputGroupFile">
      <BIconCloudUpload style="font-size: 1.5rem; color: cornflowerblue;"
    /></label>
    <input
      type="file"
      class="form-control form-control"
      id="inputGroupFile"
      aria-describedby="inputGroupFileAddon04"
      aria-label="Upload"
      ref="file"
      @change="loadTextFromFile"
    />

    <button
      class="btn btn-outline-success"
      type="button"
      id="inputGroupFileAddon04"
      :disabled="!hasJsonChosen"
      @click="readFile"
    >
      <span>Import</span>
    </button>
  </div>
</template>

<style lang="scss">
.inputbox {
  height: max-content;
}
.clickable {
  &:hover {
    cursor: pointer;
  }
}
.custom-file-button {
  input[type="file"] {
    margin-left: -2px !important;

    &::-webkit-file-upload-button {
      display: none;
    }
    &::file-selector-button {
      display: none;
    }
  }
}
</style>
