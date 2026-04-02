<template>
  <v-dialog :model-value="PageRouting" max-width="520" persistent>
    <v-card class="modern-card">

      <!-- HEADER -->
      <div class="dialog-header">
        <div>
          <div class="dialog-heading">Create Form</div>
          <div class="dialog-subheading">
            You can create a form now or skip this step
          </div>
        </div>

        <v-btn icon variant="text" @click="closeDialog">
          <v-icon size="20">mdi-close</v-icon>
        </v-btn>
      </div>

      <v-divider />

      <!-- BODY -->
      <v-card-text class="dialog-body">
        <div class="icon-box">
          <v-icon size="28" color="white">mdi-form-select</v-icon>
        </div>

        <div class="dialog-title">
          No Form Linked Yet
        </div>

        <div class="dialog-subtitle">
          Create a form now to start tagging it with your Work Type
        </div>
      </v-card-text>

      <!-- ACTIONS (IMPORTANT FIX) -->
      <v-card-actions class="dialog-actions">
        <v-btn
          variant="outlined"
          class="skip-btn"
          @click="closeDialog"
        >
          Skip
        </v-btn>

        <v-btn
          class="create-btn"
          @click="CreateForm"
        >
          <v-icon start>mdi-plus</v-icon>
          Design Form
        </v-btn>
      </v-card-actions>

    </v-card>
  </v-dialog>
</template>
<script>
export default {
  props: {
    PageRouting: Boolean,
  },
  methods: {
    closeDialog() {
      this.$emit("close", 0);
    },
CreateForm() {
  console.log("CLICK");

  this.$emit("close");

  this.$nextTick(() => {
  this.$store.commit("SET_ACTIVE_TAB", "form");

this.$router.push({
  name: "ProofofWork"
});
    // 🔥 Delay AFTER route change
    setTimeout(() => {
      this.$store.commit("OPEN_CREATE_FORM", true);
    }, 300);
  });
}
  }
};
</script>
<style scoped>

.modern-card {
  border-radius: 18px;
  padding: 20px;
  background: #fff;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);

  display: flex;
  flex-direction: column;
}

/* HEADER */
.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.dialog-heading {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.dialog-subheading {
  font-size: 13px;
  color: #6b7280;
}

/* BODY */
.dialog-body {
  text-align: center;
  padding: 24px 10px;
}

/* ICON */
.icon-box {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  margin: 0 auto 12px;

  display: flex;
  align-items: center;
  justify-content: center;

  background: linear-gradient(135deg, #dd4d78, #f06292);
  box-shadow: 0 6px 16px rgba(221, 77, 120, 0.3);
}

/* TEXT */
.dialog-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.dialog-subtitle {
  font-size: 13px;
  color: #6b7280;
  margin-top: 4px;
}

/* ACTIONS (KEY FIX) */
.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 0 0;
}

/* BUTTONS */
.create-btn {
  background: linear-gradient(135deg, #dd4d78, #f06292);
  color: white;
  border-radius: 10px;
  font-weight: 600;
  padding: 6px 16px;
}

.skip-btn {
  border-radius: 10px;
}

/* PREVENT OVERFLOW */
:deep(.v-overlay__content) {
  max-height: 90vh;
}

</style>
