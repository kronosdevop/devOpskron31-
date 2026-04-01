<template>
  <!-- eslint-disable -->
  <div>
    <v-dialog
      :model-value="requestAccessDialog"
      @update:model-value="$emit('clicked')"
      persistent
      max-width="450"
      transition="dialog-bottom-transition"
      :key="`dialog-${rowInfo.team_id || 'default'}`"
      class="resize-observer-fix"
    >
      <v-card class="dialog-card">
        <v-toolbar
          color="primary"
          dark
          density="compact"
          class="px-4 dialog-toolbar"
        >
          <v-toolbar-title class="text-h6 font-weight-medium">
            Request Access
          </v-toolbar-title>
          <v-spacer />
          <v-btn icon variant="text" @click="$emit('clicked')" size="small">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>

        <v-card-text class="pa-6 dialog-content">
          <div class="text-body-1 mb-4">
            Initiate a workflow to request access to this channel:
          </div>
          <v-chip
            color="primary"
            variant="tonal"
            size="large"
            class="mb-4 channel-chip"
          >
            <v-icon start>mdi-bullhorn-outline</v-icon>
            {{ rowInfo.team_name }}
          </v-chip>
          <div class="text-caption text-medium-emphasis">
            Your request will be sent to the channel administrators for
            approval.
          </div>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4 dialog-actions">
          <v-spacer />
          <v-btn variant="text" @click="$emit('clicked')" class="mr-2">
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            :loading="loading"
            @click="request_access()"
            prepend-icon="mdi-send"
          >
            Send Request
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
/* eslint-disable */
import { request_channel_access } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import { update_audit_logs } from "@/mixins/AuditLogActions.js";

export default {
  props: {
    requestAccessDialog: {
      type: Boolean,
      default: false,
    },
    rowInfo: {
      type: Object,
      default: () => ({}),
    },
  },
  mixins: [update_audit_logs],
  data() {
    return {
      loading: false,
    };
  },
  methods: {
    async request_access() {
      this.loading = true;
      const data = this.$store.getters.GetUserObj;

      try {
        const result = await API.graphql(
          graphqlOperation(request_channel_access, {
            input: {
              team_id: this.rowInfo.team_id,
              organization_id: data.organization.organization_id,
              user_email_id: data.user.user_email_id,
            },
          })
        );

        const response = JSON.parse(result.data.request_channel_access);
        this.loading = false;

        if (response.Status === "SUCCESS") {
          this.$emit("successMsg", response.Message);
          this.$emit("clicked"); // Close dialog on success
        } else {
          this.$emit(
            "errorMsg",
            response.Message || "Failed to request access"
          );
        }
      } catch (error) {
        this.loading = false;
        const errorMessage =
          error.errors?.[0]?.message ||
          error.message ||
          "An unexpected error occurred";
        this.$emit("errorMsg", errorMessage);
      }
    },
  },
};
</script>

<style scoped>
/* Fix ResizeObserver loop error */
.v-dialog {
  contain: layout style paint;
}

.v-card {
  contain: layout style paint;
}

/* Prevent layout shifts */
.v-toolbar {
  min-height: 48px;
}

.v-card-text {
  min-height: 120px;
}

.v-card-actions {
  min-height: 56px;
}

/* Smooth transitions */
.v-dialog .v-card {
  transition: transform 0.2s ease-out;
}

/* Prevent overflow issues */
.v-chip {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Ensure proper spacing */
.v-card-text .text-body-1 {
  line-height: 1.5;
}

.v-card-text .text-caption {
  line-height: 1.4;
}

/* Fix button alignment */
.v-card-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .v-dialog {
    margin: 16px;
  }

  .v-card-text {
    padding: 16px !important;
  }

  .v-card-actions {
    padding: 16px !important;
  }
}
</style>