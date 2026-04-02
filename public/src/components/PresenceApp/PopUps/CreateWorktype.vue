<template>
  <v-dialog :model-value="worktypecreate" max-width="520" persistent>
    <v-card class="pa-6 rounded-2xl modern-card">
      <!-- HEADER -->
      <div class="d-flex justify-space-between align-center mb-4">
        <div>
          <div class="text-h6 font-weight-bold">Create Work Type</div>
          <div class="text-caption text-grey">
            Configure a new work category
          </div>
        </div>

        <v-btn icon variant="text" @click="closedialog">
          <v-icon size="20">mdi-close</v-icon>
        </v-btn>
      </div>

      <v-divider class="mb-5" />

      <!-- FORM -->
      <div class="d-flex flex-column gap-6">
        <!-- Work Name -->
        <v-text-field
          v-model="workname"
          label="Work Type Name *"
          variant="outlined"
          density="comfortable"
          prepend-inner-icon="mdi-briefcase-outline"
          class="input-field"
          :rule="[(v) => !!v || 'WorkType Name Required']"
        />

        <!-- Enable Attachment -->
        <div>
          <div class="text-subtitle-2 font-weight-medium mb-3">
            Enable Attachment?
          </div>

          <div class="toggle-group">
            <div
              class="toggle-card"
              :class="{ active: enableAttachment === 'YES' }"
              @click="enableAttachment = 'YES'"
            >
              <v-icon size="18">mdi-check-circle-outline</v-icon>
              <span>Yes</span>
            </div>

            <div
              class="toggle-card"
              :class="{ active: enableAttachment === 'NO' }"
              @click="enableAttachment = 'NO'"
            >
              <v-icon size="18">mdi-close-circle-outline</v-icon>
              <span>No</span>
            </div>
          </div>
        </div>

        <!-- Attachment Source -->
        <div v-if="enableAttachment === 'YES'">
          <div class="text-subtitle-2 font-weight-medium mb-3">
            Attachment Source
          </div>

          <div class="toggle-group">
            <div
              class="toggle-card"
              :class="{ active: attachmentSource === 'CAMERA' }"
              @click="attachmentSource = 'CAMERA'"
            >
              <v-icon size="18">mdi-camera-outline</v-icon>
              <span>Camera</span>
            </div>

            <div
              class="toggle-card"
              :class="{ active: attachmentSource === 'BOTH' }"
              @click="attachmentSource = 'BOTH'"
            >
              <v-icon size="18">mdi-image-multiple-outline</v-icon>
              <span>Camera + Gallery</span>
            </div>
          </div>
        </div>

        <!-- BUTTON -->
        <v-btn
          class="create-btn"
          block
          size="large"
          :loading="loading"
          @click="Add_worktype"
        >
          <v-icon start>mdi-plus</v-icon>
          Create Work Type
        </v-btn>
      </div>
    </v-card>
  </v-dialog>
  <FormRouting :PageRouting="PageRouting" @close="handleSkip" />
</template>
<script>
import { API, graphqlOperation } from "aws-amplify";
import { add_worktype } from "@/graphql/mutations.js";
import FormRouting from "@/components/PresenceApp/PopUps/FormRouting.vue";

export default {
  props: {
    worktypecreate: Boolean,
  },
  components: {
    FormRouting,
  },

  data() {
    return {
      workname: "",
      enableAttachment: "NO",
      attachmentSource: null,
      loading: false,
      PageRouting: false,
    };
  },
  watch: {
    enableAttachment(val) {
      if (val === "NO") {
        this.attachmentSource = null;
      }
    },
  },
  methods: {
    closedialog() {
      this.$emit("close", 0);
    },
    resetForm() {
      this.workname = "";
      this.enableAttachment = null;
      this.attachmentSource = null;
    },
    handleSkip() {
      this.PageRouting = false;
      this.closedialog();
      this.$emit(
        "successMsg",
        "✅ Work Type created successfully! Now create a form and tag it to get started.",
      );
    },

    async Add_worktype() {
      this.loading = true;
      const data = this.$store.getters.GetUserObj;

      try {
        const result = await API.graphql(
          graphqlOperation(add_worktype, {
            input: {
              worktype_name: this.workname,
              is_attachment_enabled: this.enableAttachment === "YES",

              attachment_source:
                this.enableAttachment === "YES" ? this.attachmentSource : null,
            },
          }),
        );

        const response = JSON.parse(result.data.add_worktype);

        if (response.Status === "SUCCESS") {
          this.PageRouting = true;
          this.closedialog();

          this.resetForm();
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (e) {
        console.log("error", e);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.modern-card {
  background: #ffffff;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

.input-field :deep(.v-field) {
  border-radius: 12px;
}

.gap-6 {
  gap: 24px;
}

.toggle-group {
  display: flex;
  gap: 12px;
}

.toggle-card {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  padding: 12px;
  border-radius: 12px;

  border: 1px solid #e5e7eb;
  background: #f9fafb;

  cursor: pointer;
  transition: all 0.25s ease;
  font-weight: 500;
}

.toggle-card:hover {
  background: #f3f4f6;
}

.toggle-card.active {
  border-color: #be185d;
  background: #eef2ff;
  color: #ec4899;
  transform: scale(1.02);
}

.create-btn {
  background: linear-gradient(135deg, #be185d, #ec4899);
  color: white;
  border-radius: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
  transition: 0.3s;
}

.create-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.3);
}
</style>
