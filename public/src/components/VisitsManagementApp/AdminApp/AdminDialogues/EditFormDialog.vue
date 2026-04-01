<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog :model-value="formedition" @update:model-value="$emit('update:formedition', $event)" persistent fullscreen transition="dialog-top-transition">
      <v-card flat>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black">
            <div class="custom-title">Edit Visit Type</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text>
          <AdminFormDesigner
            :key="componentCheck"
            v-on:errorMsg="error_info"
            v-on:successMsg="success_info"
          />
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template><script>
/*eslint-disable*/
import AdminFormDesigner from "@/components/FormDesigner/AdminFormDesigner.vue";
export default {
  components: {
    AdminFormDesigner,
  },
  props: {
    formedition: Boolean,
  },
  data() {
    return {
      componentCheck: 0,
    };
  },
  watch: {
    formedition: {
      async handler() {
        if (this.formedition == true) {
          this.componentCheck += 1;
      
        }
      },
      immediate: true,
    },
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },
    error_info(val) {
      this.$emit("errorMsg", val);
    },
    success_info(val) {
      this.$emit("successMsg", val);
    },
  },
};
</script>