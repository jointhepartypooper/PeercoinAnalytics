//see also https://github.com/fengyuanchen/vue-number-input/tree/main/src //made
some changes to replace watch and edit props weirdness
<script setup lang="ts">
import { computed, ref, type PropType } from "vue";
const emit = defineEmits(["update:modelValue"]);

const isNaN = Number.isNaN || window.isNaN;
const REGEXP_NUMBER = /^-?(?:\d+|\d+\.\d+|\.\d+)(?:[eE][-+]?\d+)?$/;
const REGEXP_DECIMALS = /\.\d*(?:0|9){10}\d*$/;
const normalizeDecimalNumber = (value: number, times = 100000000000) =>
  REGEXP_DECIMALS.test(String(value))
    ? Math.round(value * times) / times
    : value;

const props = defineProps({
  center: {
    type: Boolean,
    default: false,
  },
  controls: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  inputtable: {
    type: Boolean,
    default: true,
  },
  inline: {
    type: Boolean,
    default: false,
  },
  maxlength: {
    type: Number,
    default: Infinity,
  },
  max: {
    type: Number,
    default: Infinity,
  },

  min: {
    type: Number,
    default: -Infinity,
  },
  name: {
    type: String,
    default: undefined,
  },
  inputclass: {
    type: String,
    default: "vue-number-input__input",
  },
  placeholder: {
    type: String,
    default: undefined,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  required: {
    type: Boolean,
    default: false,
  },
  rounded: {
    type: Boolean,
    default: false,
  },
  size: {
    type: String,
    default: undefined,
  },

  step: {
    type: Number,
    default: 1,
  },

  modelValue: {
    type: Number,
    default: NaN,
  },
});

//replace value with computed:
const internalValue = computed<number | undefined>(() => {
  return props.modelValue;
});
const increasable = computed<boolean>(() => {
  return (
    isNaN(internalValue.value) ||
    internalValue.value == undefined ||
    internalValue.value < props.max
  );
});

const decreasable = computed<boolean>(() => {
  return (
    isNaN(internalValue.value) ||
    internalValue.value == undefined ||
    internalValue.value > props.min
  );
});

function onChange(event: any): void {
  const target = event.target as HTMLInputElement;
  setValue(target.value);
}

function onPaste(event: ClipboardEvent) {
  const clipboardData = event.clipboardData || (window as any).clipboardData;

  if (clipboardData && !REGEXP_NUMBER.test(clipboardData.getData("text"))) {
    event.preventDefault();
  }
}

function increase(): void {
  if (increasable.value) {
    let newVal = internalValue.value ?? 0;
    setValue(normalizeDecimalNumber(newVal + props.step));
  }
}

function decrease(): void {
  if (decreasable.value) {
    let newVal = internalValue.value ?? 0;
    setValue(normalizeDecimalNumber(newVal - props.step));
  }
}

/**
 * Set new value and dispatch change event.
 * @param {number} value - The new value to set.
 */

function setValue(valueIn: number | string): void {
  const oldValue = internalValue.value;
  let newValue =
    (typeof valueIn !== "number" ? parseFloat(valueIn) : valueIn) ?? 0;

  if (!isNaN(newValue)) {
    if (props.min <= props.max) {
      newValue = Math.min(props.max, Math.max(props.min, newValue));
    }

    if (props.rounded) {
      newValue = Math.round(newValue);
    }
  }

  if (newValue !== oldValue) emit("update:modelValue", newValue, oldValue);
}
</script>

<template>
  <div
    class="vue-number-input"
    :class="{
      'vue-number-input--inline': inline,
      'vue-number-input--center': center,
      'vue-number-input--controls': controls,
      [`vue-number-input--${size}`]: size,
    }"
  >
    <button
      v-if="controls"
      class="vue-number-input__button vue-number-input__button--minus"
      type="button"
      tabindex="-1"
      :disabled="disabled || readonly || !decreasable"
      @click.prevent="decrease"
    />
    <input
      ref="input"
      :class="inputclass"
      :size="size"
      :maxlength="maxlength"
      :multiple="false"
      type="number"
      :name="name"
      :value="isNaN(internalValue) ? '' : internalValue"
      :min="min"
      :max="max"
      :step="step"
      :readonly="readonly || !inputtable"
      :disabled="disabled || (!decreasable && !increasable)"
      :placeholder="placeholder"
      autocomplete="off"
      :required="required"
      @change="onChange"
      @paste="onPaste"
    />
    <button
      v-if="controls"
      class="vue-number-input__button vue-number-input__button--plus"
      type="button"
      tabindex="-1"
      :disabled="disabled || readonly || !increasable"
      @click.prevent="increase"
    />
  </div>
</template>

<style lang="scss" scoped>
.vue-number-input {
  display: block;
  font-size: 0;
  max-width: 100%;
  overflow: hidden;
  position: relative;

  &__button {
    background-color: #fff;
    border: 0;
    border-radius: 0.25rem;
    bottom: 1px;
    position: absolute;
    top: 1px;
    width: 2.5rem;
    z-index: 1;

    &:focus {
      outline: none;
    }

    &:hover {
      &::before,
      &::after {
        background-color: #0074d9;
      }
    }

    &:disabled {
      opacity: 0.65;

      &::before,
      &::after {
        background-color: #ddd;
      }
    }

    &::before,
    &::after {
      background-color: #111;
      content: "";
      left: 50%;
      position: absolute;
      top: 50%;
      transform: translate(-50%, -50%);
      transition: background-color 0.15s;
    }

    &::before {
      height: 1px;
      width: 50%;
    }

    &::after {
      height: 50%;
      width: 1px;
    }

    &--minus {
      border-bottom-right-radius: 0;
      border-right: 1px solid #ddd;
      border-top-right-radius: 0;
      left: 1px;

      &::after {
        visibility: hidden;
      }
    }

    &--plus {
      border-bottom-left-radius: 0;
      border-left: 1px solid #ddd;
      border-top-left-radius: 0;
      right: 1px;
    }
  }

  &__input {
    -moz-appearance: textfield;
    background-color: #fff;
    border: 1px solid #ddd;
    border-radius: 0.25rem;
    display: block;
    font-size: 1rem;
    line-height: 1.5;
    max-width: 100%;
    min-height: 1.5rem;
    min-width: 3rem;
    padding: 0.4375rem 0.875rem;
    transition: border-color 0.15s;
    width: 100%;

    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
    }

    &:focus {
      border-color: #0074d9;
      outline: none;
    }

    &:disabled,
    &[readonly] {
      background-color: #f8f8f8;
    }
  }

  &--inline {
    display: inline-block;

    & > input {
      display: inline-block;
      width: 12.5rem;
    }
  }

  &--center {
    & > input {
      text-align: center;
    }
  }

  &--controls {
    & > input {
      padding-left: 3.375rem;
      padding-right: 3.375rem;
    }
  }

  &--small {
    & > input {
      border-radius: 0.1875rem;
      font-size: 0.875rem;
      padding: 0.25rem 0.5rem;
    }

    &.vue-number-input--inline > input {
      width: 10rem;
    }

    &.vue-number-input--controls > button {
      width: 2rem;
    }

    &.vue-number-input--controls > input {
      padding-left: 2.5rem;
      padding-right: 2.5rem;
    }
  }

  &--large {
    & > input {
      border-radius: 0.3125rem;
      font-size: 1.25rem;
      padding: 0.5rem 1rem;
    }

    &.vue-number-input--inline > input {
      width: 15rem;
    }

    &.vue-number-input--controls > button {
      width: 3rem;
    }

    &.vue-number-input--controls > input {
      padding-left: 4rem;
      padding-right: 4rem;
    }
  }
}
</style>
