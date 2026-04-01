<template>
  <div>
    <ImagePreviewDialog
      :DialogImagePreview="DialogImagePreview"
      :previewImage="previewImage"
      @clicked="DialogImagePreviewEmit"
    />
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <v-dialog
      :model-value="DialogCreatedTicketDetails"
      max-width="1200px"
      persistent
    >
      <v-card rounded="lg" class="d-flex flex-column" style="height: 100vh">
        <!-- Card Title -->
        <v-card-title
          class="d-flex align-center justify-space-between px-6 py-4"
          style="flex-shrink: 0"
        >
          Ticket Details - {{ ListAllCreatedTicketDetails.ticket_id }} (Due -
          {{
            ConvertEnteredDueDate(ListAllCreatedTicketDetails.due_date) ||
            "TBD"
          }})
          <v-btn
            icon
            variant="text"
            @click="DialogCreatedTicketDetailsEmit(1)"
            size="small"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider></v-divider>

        <!-- Overlay -->
        <v-overlay
          v-model="loading"
          contain
          class="align-center justify-center text-center overlay"
        >
          <v-progress-circular indeterminate color="primary" size="64" />
          <div class="text-white mt-2">Loading...</div>
        </v-overlay>

        <!-- Form Fields, Images, and Comments -->
        <div class="flex-grow-1 overflow-y-auto" style="padding: 20px">
          <v-row class="pa-5">

            <!-- Form Fields Row -->
            <v-col cols="6">
              <!--Created by and on-->
              <v-row
                no-gutter
                v-if="
                  ListAllCreatedTicketDetails.created_by !== currentUserEmail
                "
              >
                <v-col cols="6">
                  <span>
                    <div class="font-weight-bold mr-2">Created by</div>
                    <div style="font-size: 14px" class="mt-1">
                      {{ ListAllCreatedTicketDetails.created_by }}
                    </div>
                  </span>
                </v-col>
                <v-col cols="6">
                  <span>
                    <div class="font-weight-bold mr-2 ml-n3">Created on</div>
                    <div style="font-size: 14px" class="mt-1 ml-n3">
                      {{ ConvertDate(ListAllCreatedTicketDetails.created_at) }}
                    </div>
                  </span>
                </v-col>
              </v-row>

              <!--Ticket ID and Distribution Method-->
              <v-row
                no-gutters
                :class="
                  ListAllCreatedTicketDetails.created_by !== currentUserEmail
                    ? 'mt-6'
                    : ''
                "
              >
                <v-col cols="6">
                  <span>
                    <div class="font-weight-bold mr-2">ID</div>
                    <div style="font-size: 14px" class="mt-1">
                      {{ ListAllCreatedTicketDetails.ticket_id }}
                    </div>
                  </span>
                </v-col>

                <v-col cols="6">
                  <span>
                    <div class="font-weight-bold mr-2">Distribution Method</div>
                    <div style="font-size: 14px" class="mt-1">
                      {{
                        ListAllCreatedTicketDetails.distribution_method ===
                        "CLAIM_TICKET"
                          ? "Claim"
                          : ListAllCreatedTicketDetails.distribution_method ===
                            "ROUND_ROBIN"
                          ? "Round Robin"
                          : ListAllCreatedTicketDetails.distribution_method ===
                            "LOAD_SHARING"
                          ? "Load Sharing"
                          : "Moderator"
                      }}
                    </div>
                  </span>
                </v-col>
              </v-row>

              <!--Ticket Title and Description-->
              <v-row no-gutters class="mt-6">
                <v-col v-if="isEditing" cols="12" md="12">
                  <span>
                    <div
                      :class="[
                        'font-weight-bold',
                        isEditing ? 'text-primary' : '',
                      ]"
                    >
                      Title
                    </div>
                    <v-textarea
                      v-model="edited_title"
                      rounded="lg"
                      variant="outlined"
                      density="compact"
                      class="mt-1 ml-n1 pa-1"
                    />
                  </span>
                </v-col>

                <v-col v-else cols="6" md="6">
                  <div class="font-weight-bold mr-2">Title</div>
                  <div class="text-wrap mt-1" style="font-size: 14px">
                    {{ ListAllCreatedTicketDetails.title }}
                  </div>
                </v-col>

                <v-col v-if="isEditing" cols="12" md="12">
                  <div
                    :class="[
                      'font-weight-bold',
                      isEditing ? 'text-primary' : '',
                    ]"
                  >
                    Description
                  </div>
                  <v-textarea
                    v-if="isEditing"
                    v-model="edited_description"
                    rounded="lg"
                    variant="outlined"
                    class="mt-1 ml-n1 pa-1"
                  />
                </v-col>

                <v-col v-else cols="6" md="6">
                  <div class="font-weight-bold mr-2">Description</div>
                  <div class="text-wrap mt-1" style="font-size: 14px">
                    {{ ListAllCreatedTicketDetails.description }}
                  </div>
                </v-col>
              </v-row>

              <!--Ticket Category and Ticket Assigned On-->
              <v-row no-gutters class="mt-6">
                <v-col cols="6">
                  <div
                    v-if="
                      ListAllCreatedTicketDetails?.assigned_to_email?.startsWith(
                        'POOL_'
                      )
                    "
                  >
                    <span>
                      <div class="font-weight-bold mr-2">Assigned To</div>
                      <div class="mt-1">
                        {{ ListAllCreatedTicketDetails.category_name }}
                      </div>
                    </span>
                  </div>
                  <div v-else>
                    <span>
                      <div class="font-weight-bold mr-2">Assigned To</div>
                      <div style="font-size: 14px" class="mt-1">
                        {{ ListAllCreatedTicketDetails.assigned_to_name }} ({{
                          ListAllCreatedTicketDetails.assigned_to_email
                        }})
                      </div>
                    </span>
                  </div>
                </v-col>

                <v-col cols="6">
                  <span>
                    <div class="font-weight-bold mr-2">Assigned On</div>
                    <div style="font-size: 14px" class="mt-1">
                      {{
                        ConvertAssignedDate(
                          ListAllCreatedTicketDetails.assigned_at
                        )
                      }}
                    </div>
                  </span>
                </v-col>
              </v-row>

              <!--Ticket Status and Due Date-->
              <v-row no-gutters class="mt-6">
                <v-col :cols="bothStatusesInOneRow ? 6 : 6">
                  <div v-if="updatingStatus || closeReopenTicket">
                    <div
                      :class="[
                        'font-weight-bold',
                        updatingStatus || closeReopenTicket
                          ? 'text-primary'
                          : '',
                      ]"
                    >
                      Ticket Status
                    </div>
                    <v-select
                      v-model="ticket_status"
                      rounded="lg"
                      variant="outlined"
                      density="compact"
                      class="mt-1 ml-n1 pa-1"
                      width="250"
                      :items="ticketStatusOptions"
                      item-title="title"
                      item-value="value"
                      :readonly="!updatingStatus && !closeReopenTicket"
                    />
                  </div>
                  <div v-else>
                    <span>
                      <div class="font-weight-bold mr-2">Ticket Status</div>
                      <v-chip
                        :color="
                          ListAllCreatedTicketDetails.status === 'OPEN'
                            ? 'blue'
                            : ListAllCreatedTicketDetails.status === 'ONHOLD'
                            ? 'orange'
                            : ListAllCreatedTicketDetails.status ===
                              'IN_PROGRESS'
                            ? 'primary'
                            : ListAllCreatedTicketDetails.status === 'RESOLVED'
                            ? '#607D8B'
                            : ListAllCreatedTicketDetails.status === 'CLOSED'
                            ? 'green'
                            : ListAllCreatedTicketDetails.status === 'REOPEN'
                            ? '#311B92'
                            : 'grey-darken-2'
                        "
                        size="small"
                        class="mt-1"
                      >
                        {{
                          ListAllCreatedTicketDetails.status === "OPEN"
                            ? "Open"
                            : ListAllCreatedTicketDetails.status === "ONHOLD"
                            ? "On Hold"
                            : ListAllCreatedTicketDetails.status ===
                              "IN_PROGRESS"
                            ? "In Progress"
                            : ListAllCreatedTicketDetails.status === "RESOLVED"
                            ? "Resolved"
                            : ListAllCreatedTicketDetails.status === "CLOSED"
                            ? "Closed"
                            : ListAllCreatedTicketDetails.status === "REOPEN"
                            ? "Re-Opened"
                            : "Cancelled"
                        }}
                      </v-chip>
                    </span>
                  </div>
                </v-col>

                <v-col cols="6" v-if="bothStatusesInOneRow">
                  <div v-if="isClaiming">
                    <div
                      :class="[
                        'font-weight-bold',
                        isClaiming ? 'text-primary' : '',
                      ]"
                    >
                      Claim Status
                    </div>
                    <v-select
                      v-if="isClaiming"
                      v-model="edited_claim_status"
                      rounded="lg"
                      variant="outlined"
                      density="compact"
                      width="250"
                      class="mt-1 ml-n1 pa-1"
                      :items="ClaimStatusItems"
                    />
                  </div>

                  <div
                    v-else-if="
                      ListAllCreatedTicketDetails.distribution_method ===
                      'CLAIM_TICKET'
                    "
                  >
                    <span>
                      <div class="font-weight-bold mr-2">Claim Status</div>
                      <v-chip
                        :color="
                          ListAllCreatedTicketDetails.claim_status ===
                          'UNCLAIMED'
                            ? 'red'
                            : 'green'
                        "
                        size="small"
                        class="mt-1"
                        >{{
                          ListAllCreatedTicketDetails.claim_status ===
                          "UNCLAIMED"
                            ? "Unclaimed"
                            : "Claimed"
                        }}</v-chip
                      >
                    </span>
                  </div>

                  <div v-else>
                    <span>
                      <div class="font-weight-bold mr-2">Assignment Status</div>
                      <v-chip
                        :color="
                          ListAllCreatedTicketDetails.assignment_status ===
                          'UNASSIGNED'
                            ? 'green'
                            : 'red'
                        "
                        size="small"
                        class="mt-1"
                      >
                        {{
                          ListAllCreatedTicketDetails.status === "UNASSIGNED"
                            ? "Unassigned"
                            : "Assigned"
                        }}
                      </v-chip>
                    </span>
                  </div>
                </v-col>

                <v-col cols="6" v-if="updatingStatus">
                  <div
                    :class="[
                      'font-weight-bold',
                      updatingStatus ? 'text-primary' : '',
                    ]"
                    v-if="
                      ticket_status === 'IN_PROGRESS' ||
                      ticket_status === 'RESOLVED' ||
                      ticket_status === 'OPEN' ||
                      ticket_status === 'REOPEN'
                    "
                  >
                    Due Date
                  </div>
                  <div
                    :class="[
                      'font-weight-bold',
                      updatingStatus ? 'text-primary' : '',
                    ]"
                    v-else-if="ticket_status === 'ONHOLD'"
                  >
                    On Hold Till
                  </div>
                  <v-menu v-model="date" :close-on-content-click="false">
                    <template #activator="{ props }">
                      <v-text-field
                        v-bind="props"
                        rounded="lg"
                        variant="outlined"
                        density="compact"
                        width="250"
                        class="mt-1 ml-n1 pa-1"
                        :model-value="formatedDueDate"
                        :readonly="!updatingStatus"
                      />
                    </template>
                    <v-date-picker
                      v-model="enteredDate"
                      header-color="primary"
                      :min="new Date()"
                      :allowed-dates="allowedDates"
                    >
                      <template #actions>
                        <v-btn color="primary" @click="date = false">
                          Close
                        </v-btn>
                      </template>
                    </v-date-picker>
                  </v-menu>
                </v-col>
              </v-row>

              <!--Reassign To Agents and Status Based Comments-->
              <v-row no-gutters class="mt-6">
                <!--Reassign Agents-->
                <v-col
                  cols="12"
                  v-if="
                    (updatingStatus &&
                      (ticket_status != 'RESOLVED' ||
                        ticket_status === 'OPEN')) ||
                    assigningAgent
                  "
                >
                  <div
                    :class="[
                      'font-weight-bold mt-n4',
                      updatingStatus || assigningAgent ? 'text-primary' : '',
                    ]"
                  >
                    Assign
                  </div>
                  <v-select
                    v-model="agents"
                    :items="reassignAgents"
                    item-title="title"
                    item-value="value"
                    variant="outlined"
                    density="compact"
                    rounded="lg"
                    class="mt-1 ml-n1 pa-1"
                    width="250"
                    :readonly="!(updatingStatus || assigningAgent)"
                  />
                </v-col>

                <!--Comments-->
                <v-col
                  cols="12"
                  v-if="
                    (updatingStatus || closeReopenTicket) &&
                    (ticket_status === 'IN_PROGRESS' ||
                      ticket_status === 'ONHOLD' ||
                      ticket_status === 'OPEN' ||
                      ticket_status === 'REOPEN')
                  "
                >
                  <div
                    :class="[
                      'font-weight-bold mt-n4',
                      updatingStatus ? 'text-primary' : '',
                    ]"
                  >
                    Comments
                  </div>
                  <v-textarea
                    rounded="lg"
                    variant="outlined"
                    v-model="resolution_note"
                    class="mt-1 ml-n1 pa-1"
                    width="530"
                    maxlength="200"
                    :counter="200"
                    :readonly="!(updatingStatus || closeReopenTicket)"
                  />
                </v-col>

                <!--Resolution Note-->
                <v-col
                  cols="12"
                  v-if="updatingStatus && ticket_status === 'RESOLVED'"
                >
                  <div
                    :class="[
                      'font-weight-bold mt-n8',
                      updatingStatus ? 'text-primary' : '',
                    ]"
                  >
                    Resolution Note
                  </div>
                  <v-textarea
                    rounded="lg"
                    variant="outlined"
                    v-model="resolution_note"
                    class="mt-1 ml-n1 pa-1"
                    width="530"
                    maxlength="200"
                    :counter="200"
                    :readonly="!updatingStatus"
                  />
                </v-col>

                <!--Deletion Note-->
                <v-col cols="12" v-if="confirmDelete">
                  <div
                    class="font-weight-bold mt-n2 text-primary"
                    :class="[
                      'font-weight-bold',
                      confirmDelete ? 'text-primary' : '',
                    ]"
                  >
                    Deletion Reason <span class="text-error">*</span>
                  </div>
                  <v-textarea
                    rounded="lg"
                    variant="outlined"
                    v-model="reason"
                    class="mt-1 ml-n1 pa-1"
                    width="530"
                    maxlength="200"
                    :counter="200"
                    :rules="[(v) => !!v || 'Required']"
                  />
                </v-col>
              </v-row>

              <!--Claimed by and on-->
              <v-row
                no-gutters
                class="mt-n1"
                v-if="ListAllCreatedTicketDetails.claim_status === 'CLAIMED'"
              >
                <v-col
                  cols="6"
                  v-if="
                    ListAllCreatedTicketDetails.claimed_by &&
                    ListAllCreatedTicketDetails.claimed_by.length > 0
                  "
                >
                  <span>
                    <div class="font-weight-bold mr-2">Claimed by</div>
                    <div style="font-size: 14px" class="mt-1">
                      {{ ListAllCreatedTicketDetails.claimed_by || "-" }}
                    </div>
                  </span>
                </v-col>
                <v-col
                  cols="6"
                  v-if="
                    ListAllCreatedTicketDetails.claimed_at &&
                    ListAllCreatedTicketDetails.claimed_at.length > 0
                  "
                >
                  <span>
                    <div class="font-weight-bold mr-2">Claimed on</div>
                    <div style="font-size: 14px" class="mt-1">
                      {{
                        ConvertClaimedAtDate(
                          ListAllCreatedTicketDetails.claimed_at
                        )
                      }}
                    </div>
                  </span>
                </v-col>
              </v-row>

              <!--Resolved by and on-->
              <v-row
                no-gutters
                class="mt-6"
                v-if="ListAllCreatedTicketDetails.status === 'RESOLVED'"
              >
                <v-col cols="6">
                  <span>
                    <div class="font-weight-bold mr-2">Resolved by</div>
                    <div style="font-size: 14px" class="mt-1">
                      {{ ListAllCreatedTicketDetails.resolved_by }}
                    </div>
                  </span>
                </v-col>
                <v-col cols="6">
                  <span>
                    <div class="font-weight-bold mr-2">Resolved on</div>
                    <div style="font-size: 14px" class="mt-1">
                      {{
                        ConvertResolvedAtDate(
                          ListAllCreatedTicketDetails.resolved_at
                        )
                      }}
                    </div>
                  </span>
                </v-col>
              </v-row>
            </v-col>

            <v-divider vertical></v-divider>

            <!-- Comments and Attachments Row -->
            <v-col cols="6" class="mt-n6">
              <!-- Attachments Section -->
              <v-col cols="12">
                <div class="font-weight-bold">Attachments</div>

                <!-- File Input (Edit Mode) -->
                <v-file-input
                  v-if="isEditing"
                  v-model="newUploadedFiles"
                  label="Upload New Image"
                  accept="image/*"
                  rounded="lg"
                  variant="outlined"
                  density="compact"
                  prepend-icon="mdi-paperclip"
                  class="mt-3 ml-n1 pa-1"
                  @change="onNewFileSelected"
                />

                <!-- Image Preview -->
                <v-card
                  v-if="imagePreview"
                  class="pa-2 mt-2 settings-card"
                  rounded="lg"
                  elevation="1"
                  style="width: 100%; max-width: 700px"
                  @click="OpenImagePreview"
                >
                  <v-img
                    :src="imagePreview"
                    height="200"
                    contain
                    rounded="lg"
                  />

                  <div v-if="isEditing" class="text-right mt-2">
                    <v-btn
                      color="red"
                      size="small"
                      variant="flat"
                      @click="removeAttachment"
                    >
                      Remove
                    </v-btn>
                  </div>
                </v-card>

                <!-- No Attachment Fallback -->
                <v-card
                  v-else
                  rounded="lg"
                  flat
                  class="d-flex flex-column align-center justify-center py-6"
                  style="width: 100%; max-width: 700px"
                >
                  <v-icon size="70" color="grey">mdi-camera</v-icon>
                  <div class="mt-2 text-medium-emphasis">
                    No attachments available
                  </div>
                </v-card>
              </v-col>

              <!--Comments-->
              <v-col cols="12">
                <div class="font-weight-bold">Comments</div>
                <v-card
                  class="pa-2"
                  style="max-height: 500px; overflow-y: auto"
                  height="39vh"
                  flat
                >
                  <!-- No comments Placeholder -->
                  <v-card
                    v-if="!ListAllCreatedTicketDetailsComments.length"
                    rounded="lg"
                    flat
                    class="d-flex flex-column align-center justify-center py-6 mt-2"
                    style="width: 100%; max-width: 700px"
                  >
                    <v-icon size="70" color="grey">mdi-chat</v-icon>
                    <div class="mt-2 text-medium-emphasis">
                      No comments yet!
                    </div>
                  </v-card>

                  <!-- Comments -->
                  <v-row v-else>
                    <v-col
                      cols="12"
                      v-for="(
                        item, index
                      ) in ListAllCreatedTicketDetailsComments"
                      :key="index"
                    >
                      <v-card
                        rounded="lg"
                        width="100%"
                        class="pa-2 settings-card"
                        elevation="3"
                      >
                        <v-card-text class="pt-0">{{
                          item.comment_text
                        }}</v-card-text>
                        <v-card-subtitle
                          class="text-caption text-medium-emphasis mt-n3"
                        >
                          <span>
                            {{ ConvertDate(item.created_at) }} -
                            {{ item.commented_by }}
                          </span>
                        </v-card-subtitle>
                      </v-card>
                    </v-col>
                  </v-row>
                </v-card>
              </v-col>
            </v-col>
          </v-row>
        </div>

        <!-- Buttons -->
        <v-card-actions
          class="d-flex justify-center py-3"
          style="flex-shrink: 0; border-top: 1px solid #eee"
        >
          <!--Edit-->
          <div
            v-if="
              !isEditing &&
              !confirmDelete &&
              ListAllCreatedTicketDetails.created_by === currentUserEmail &&
              ListAllCreatedTicketDetails.status != 'RESOLVED' &&
              ListAllCreatedTicketDetails.status != 'CLOSED'
            "
          >
            <v-btn
              v-if="!isEditing"
              variant="flat"
              color="green"
              rounded="lg"
              size="small"
              flat
              @click="OpenEditMode"
            >
              <v-icon color="white" class="mr-1">mdi-pencil</v-icon>
              Edit
            </v-btn>
          </div>
          <div
            v-else-if="
              isEditing &&
              ListAllCreatedTicketDetails.created_by === currentUserEmail
            "
          >
            <v-btn
              color="green"
              variant="flat"
              size="small"
              flat
              class="mr-2"
              :loading="loading"
              @click="UpdateTicket"
            >
              <v-icon color="white" class="mr-1">mdi-check</v-icon>
              Update
              <template #loader>
                <v-progress-circular indeterminate color="white" />
              </template>
            </v-btn>
            <v-btn
              color="red"
              variant="flat"
              size="small"
              flat
              @click="CancelEdit"
            >
              <v-icon color="white">mdi-close</v-icon>
              Cancel
            </v-btn>
          </div>

          <!--Delete-->
          <div
            v-if="
              !confirmDelete &&
              !isEditing &&
              !closeReopenTicket &&
              ListAllCreatedTicketDetails.created_by === currentUserEmail &&
              (ListAllCreatedTicketDetails.status === 'CLOSED' ||
                ListAllCreatedTicketDetails.status === 'OPEN')
            "
          >
            <v-btn
              v-bind="props"
              rounded="lg"
              color="red"
              variant="flat"
              size="small"
              flat
              @click="AskConfirm"
            >
              <v-icon color="white" class="mr-1">mdi-delete</v-icon>
              Delete
            </v-btn>
          </div>
          <div
            v-else-if="
              confirmDelete &&
              ListAllCreatedTicketDetails.created_by === currentUserEmail
            "
          >
            <v-btn
              rounded="lg"
              color="green"
              variant="flat"
              size="small"
              class="mr-2"
              :loading="loading"
              @click="DeleteTicket"
            >
              Are you sure?
              <template #loader>
                <v-progress-circular indeterminate color="white" />
              </template>
            </v-btn>

            <v-btn
              rounded="lg"
              color="red"
              variant="flat"
              size="small"
              @click="CancelDelete"
            >
              <v-icon color="white">mdi-close</v-icon>
              No
            </v-btn>
          </div>

          <!--Claim Ticket-->
          <div
            v-if="
              !isClaiming &&
              ListAllCreatedTicketDetails.distribution_method ===
                'CLAIM_TICKET' &&
              ListAllCreatedTicketDetails.created_by != currentUserEmail &&
              ListAllCreatedTicketDetails.claim_status === 'UNCLAIMED'
            "
          >
            <v-btn
              color="orange"
              size="small"
              rounded="lg"
              variant="flat"
              class="text-white"
              flat
              :loading="loading"
              @click="OpenClaimMode"
            >
              <v-icon color="white" class="mr-1"> mdi-ticket </v-icon>
              Claim Ticket
            </v-btn>
          </div>

          <!--Update Ticket Status-->
          <div
            v-if="
              !updatingStatus &&
              ListAllCreatedTicketDetails.claim_status === 'CLAIMED' &&
              (ListAllCreatedTicketDetails.status === 'OPEN' ||
                ListAllCreatedTicketDetails.status === 'IN_PROGRESS' ||
                ListAllCreatedTicketDetails.status === 'ONHOLD' ||
                ListAllCreatedTicketDetails.status === 'REOPEN') &&
              ListAllCreatedTicketDetails.created_by != currentUserEmail
            "
          >
            <v-btn
              v-bind="props"
              color="purple"
              size="small"
              rounded="lg"
              variant="flat"
              flat
              @click="OpenUpdateStatusMode"
            >
              <v-icon color="white" class="mr-1"> mdi-bell </v-icon>
              Update Status
            </v-btn>
          </div>
          <div v-if="updatingStatus">
            <v-btn
              color="green"
              variant="flat"
              size="small"
              class="mr-2"
              flat
              :loading="loading"
              @click="UpdateTicketStatus"
            >
              <v-icon color="white">mdi-check</v-icon>
              Save
            </v-btn>
            <v-btn
              color="red"
              variant="flat"
              size="small"
              flat
              @click="updatingStatus = false"
            >
              <v-icon color="white">mdi-close</v-icon>
              Cancel
            </v-btn>
          </div>

          <!--Close/Reopen Ticket-->
          <v-btn
            v-if="
              !closeReopenTicket &&
              !confirmDelete &&
              ((ListAllCreatedTicketDetails.status === 'RESOLVED' &&
                ListAllCreatedTicketDetails.created_by === currentUserEmail) ||
                (ListAllCreatedTicketDetails.status === 'CLOSED' &&
                  ListAllCreatedTicketDetails.created_by === currentUserEmail))
            "
            v-bind="props"
            color="teal"
            size="small"
            rounded="lg"
            variant="flat"
            @click="CloseReopenTicketMode"
          >
            <v-icon color="white" class="mr-1">mdi-ticket</v-icon>
            Close/Reopen Ticket
          </v-btn>

          <div v-if="closeReopenTicket && !updatingStatus">
            <v-btn
              color="green"
              variant="flat"
              size="small"
              rounded="lg"
              class="mr-2"
              :loading="loading"
              @click="UpdateTicketStatus"
            >
              <v-icon color="white">mdi-check</v-icon>
              Save
            </v-btn>
            <v-btn
              color="red"
              variant="flat"
              size="small"
              rounded="lg"
              @click="cancelCloseReopen"
            >
              <v-icon color="white">mdi-close</v-icon>
              Cancel
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import { update_ticket } from "@/graphql/mutations";
import { claim_external_ticket } from "@/graphql/mutations";
import { get_ticket_by_id } from "@/graphql/queries";
import { delete_ticket } from "@/graphql/mutations";
import { API, graphqlOperation } from "aws-amplify";
import { uploadToS3 } from "@/mixins/TicketsS3Upload.js";

import SnackBar from "../SnackBar.vue";
import ImagePreviewDialog from "./ImagePreviewDialog.vue";

export default {
  props: { DialogCreatedTicketDetails: Boolean, StoreObj: Object },

  components: {
    SnackBar,
    ImagePreviewDialog,
  },

  mixins: [get_all_org_users, uploadToS3],

  data: () => ({
    id: "",
    category: "",
    title: "",
    description: "",
    assignee: "",
    assigned_on: "",
    ticket_status: "",
    claim_status: "",

    agents: "",
    edited_title: "",
    edited_description: "",
    edited_claim_status: "",
    reason: "",
    resolution_note: "",
    previewImage: "",

    DialogImagePreview: false,
    closeReopenTicket: false,
    updatingStatus: false,
    confirmDelete: false,
    isClaiming: false,
    isEditing: false,
    loading: false,
    date: false,

    imagePreview: null,
    newUploadedFiles: null,

    enteredDate: new Date(),

    SnackBarComponent: {},
    orgDetails: {
      bucket_name: "stichh-medias",
      region: "us-east-1",
    },

    attachments: [],
    existingAttachments: [],
    ListAllCreatedTicketDetails: [],
    ListAllCreatedTicketDetailsComments: [],
    ClaimStatusItems: [{ title: "Claimed", value: "CLAIMED" }],
    TicketStatusListAgent: [
      { title: "Open", value: "OPEN" },
      { title: "In-Progress", value: "IN_PROGRESS" },
      { title: "On Hold", value: "ONHOLD" },
      { title: "Resolved", value: "RESOLVED" },
    ],
    TicketStatusListInitiator: [
      { title: "Reopen", value: "REOPEN" },
      { title: "Close", value: "CLOSED" },
    ],
  }),

  computed: {
    reassignAgents() {
      const t = this.ListAllCreatedTicketDetails;
      if (
        Array.isArray(t.ticket_type_auto_assign_group) &&
        t.ticket_type_auto_assign_group.length > 0
      ) {
        return t.ticket_type_auto_assign_group
          .filter((email) => email !== this.currentUserEmail)
          .map((email) => ({ title: email, value: email }));
      }
      if (
        Array.isArray(t.category_auto_assign_group) &&
        t.category_auto_assign_group.length > 0
      ) {
        return t.category_auto_assign_group
          .filter((email) => email !== this.currentUserEmail)
          .map((email) => ({ title: email, value: email }));
      }
      const fallback = t.agents_list || [];
      return fallback
        .filter((email) => email !== this.currentUserEmail)
        .map((email) => ({ title: email, value: email }));
    },
    currentUserEmail() {
      return this.$store.getters.GetUserEmail || "";
    },
    formatedDueDate() {
      if (!this.enteredDate) return "";
      return this.ConvertDueDate(this.enteredDate);
    },
    ticketStatusOptions() {
      if (this.closeReopenTicket) {
        return this.TicketStatusListInitiator;
      }
      return this.TicketStatusListAgent;
    },
    attachmentFileList() {
      if (!this.attachments || this.attachments.length === 0) return [];
      return this.attachments.map((url) => ({
        name: url.split("/").pop(),
        url,
      }));
    },
    bothStatusesInOneRow() {
      return (
        !this.isEditing &&
        !this.assigningAgent &&
        !this.updatingStatus &&
        !this.confirmDelete &&
        !this.closeReopenTicket
      );
    },
  },

  async mounted() {
    await this.get_all_org_users();
  },

  watch: {
    async DialogCreatedTicketDetails(val) {
      if (val) {
        this.loading = true;
        await this.$nextTick();
        await this.fetchTicketDetails();
        this.loading = false;
      } else {
        this.resetDialogState();
      }
    },
  },

  methods: {
    //General
    async GetCreatedTicketDetails() {
      this.loading = true;
      try {
        const result = await API.graphql(
          graphqlOperation(get_ticket_by_id, {
            input: {
              ticket_id: this.StoreObj.ticket_id,
              include_comments: true,
              include_assignments: true,
            },
          })
        );
        let resultObj = JSON.parse(result.data.get_ticket_by_id);
        if (resultObj.Status === "SUCCESS") {
          this.ListAllCreatedTicketDetails = resultObj.data.ticket;
          this.ListAllCreatedTicketDetailsComments = resultObj.data.comments;
          this.ListAllCreatedTicketDetailsComments.sort(
            (a, b) => b.created_at - a.created_at
          );
        }
        this.loading = false;
      } catch (error) {
        this.loading = false;
        this.ListAllCreatedTicketDetails = [];
        this.ListAllCreatedTicketDetailsComments = [];
      }
    },
    async fetchTicketDetails() {
      this.loading = true;

      await this.GetCreatedTicketDetails();
      this.populateFormFields();

      const att = this.ListAllCreatedTicketDetails.attachments;
      this.loadAttachment(att);

      this.loading = false;
    },
    async DialogCreatedTicketDetailsEmit(toggle) {
      if (toggle === 1) {
        this.$emit("clicked", toggle);
      } else if (toggle === 2) {
        await this.fetchTicketDetails();
        this.$emit("clicked", toggle);
      }
    },
    ConvertDate(created_at) {
      if (!created_at) return "N/A";
      const timestamp = Number(created_at);
      if (isNaN(timestamp)) return "Invalid Date";
      const date = new Date(timestamp * 1000);
      if (isNaN(date.getTime())) return "Invalid Date";
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");

      let hours = date.getHours();
      const minute = String(date.getMinutes()).padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12;

      const time = `${hours}:${minute} ${ampm}`;
      return `${dd}-${mm}-${yyyy}, ${time}`;
    },
    ConvertDueDate(enteredDate) {
      if (!enteredDate) return "N/A";
      const date = new Date(enteredDate);
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      return `${dd}-${mm}-${yyyy}`;
    },
    ConvertEnteredDueDate(due_date) {
      if (!due_date) return "TBD";
      const date = new Date(due_date * 1000);
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      return `${dd}-${mm}-${yyyy}`;
    },
    ConvertAssignedDate(assigned_at) {
      if (!assigned_at) return "N/A";
      const timestamp = Number(assigned_at);
      if (isNaN(timestamp)) return "Invalid Date";
      const date = new Date(timestamp * 1000);
      if (isNaN(date.getTime())) return "Invalid Date";
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");

      let hours = date.getHours();
      const minute = String(date.getMinutes()).padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12;

      const time = `${hours}:${minute} ${ampm}`;
      return `${dd}-${mm}-${yyyy}, ${time}`;
    },
    ConvertClaimedAtDate(claimed_at) {
      if (!claimed_at) return "N/A";
      const timestamp = Number(claimed_at);
      if (isNaN(timestamp)) return "Invalid Date";
      const date = new Date(timestamp * 1000);
      if (isNaN(date.getTime())) return "Invalid Date";
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");

      let hours = date.getHours();
      const minute = String(date.getMinutes()).padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12;

      const time = `${hours}:${minute} ${ampm}`;
      return `${dd}-${mm}-${yyyy}, ${time}`;
    },
    ConvertResolvedAtDate(resolved_at) {
      if (!resolved_at) return "N/A";
      const timestamp = Number(resolved_at);
      if (isNaN(timestamp)) return "Invalid Date";
      const date = new Date(timestamp * 1000);
      if (isNaN(date.getTime())) return "Invalid Date";
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");

      let hours = date.getHours();
      const minute = String(date.getMinutes()).padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12;

      const time = `${hours}:${minute} ${ampm}`;
      return `${dd}-${mm}-${yyyy}, ${time}`;
    },
    populateFormFields() {
      const t = this.ListAllCreatedTicketDetails;
      this.id = t.ticket_id || "";
      this.category = t.category_name || "";
      this.title = t.title || "";
      this.description = t.description || "";
      this.edited_title = this.title;
      this.edited_description = this.description;
      const assigned = t.assigned_to_email;
      if (!assigned || assigned.startsWith("POOL_")) {
        this.assignee = "";
      } else {
        this.assignee = assigned;
      }
      this.ticket_status = t.status || "";
      this.claim_status = t.claim_status || "";
      if (t.status === "OPEN") {
        this.enteredDate = new Date();
      } else if (t.due_date) {
        this.enteredDate = new Date(Number(t.due_date) * 1000);
      } else {
        this.enteredDate = new Date();
      }
    },
    resetDialogState() {
      this.agents = "";
      this.edited_title = "";
      this.resolution_note = "";
      this.edited_description = "";
      this.isEditing = false;
      this.isClaiming = false;
      this.confirmDelete = false;
      this.updatingStatus = false;
      this.assigningAgent = false;
      this.closeReopenTicket = false;
      this.imagePreview = null;
      this.newUploadedFiles = null;
      this.attachments = [];
      this.existingAttachments = [];
      this.ListAllCreatedTicketDetails = [];
      this.ListAllCreatedTicketDetailsComments = [];
    },
    cacheBust(url) {
      if (!url) return null;
      if (url.includes("X-Amz-Signature")) {
        return url;
      }
      return url + (url.includes("?") ? "&" : "?") + "t=" + Date.now();
    },
    loadAttachment(att) {
      if (!att) {
        this.imagePreview = null;
        return;
      }

      const url = Array.isArray(att) ? att[0] : att;
      this.imagePreview = url;
    },
    OpenImagePreview() {
      if (this.imagePreview) {
        this.previewImage = this.imagePreview;
      } else if (this.existingAttachments.length) {
        this.previewImage = this.cacheBust(this.existingAttachments[0]);
      } else {
        return;
      }

      this.DialogImagePreview = true;
    },
    DialogImagePreviewEmit() {
      this.DialogImagePreview = false;
    },

    //Claim Ticket Methods
    async OpenClaimMode() {
      this.loading = true;
      try {
        const result = await API.graphql(
          graphqlOperation(claim_external_ticket, {
            input: {
              ticket_id: this.StoreObj.ticket_id,
            },
          })
        );
        let resultObj = JSON.parse(result.data.claim_external_ticket);

        if (resultObj.Status === "SUCCESS") {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            SnackbarText: "☑️ " + resultObj.Message,
          };
          this.claim_status = "CLAIMED";
          this.ListAllCreatedTicketDetails.claim_status = "CLAIMED";
          this.DialogCreatedTicketDetailsEmit(2);
        } else {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: "❎ " + resultObj.Message,
          };
        }
      } catch (error) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "❎ Failed to claim ticket, try again",
        };
      }

      this.loading = false;
    },
    async UpdateClaimStatus() {
      this.loading = true;
      try {
        const result = await API.graphql(
          graphqlOperation(claim_external_ticket, {
            input: {
              ticket_id: this.StoreObj.ticket_id,
            },
          })
        );
        let resultObj = JSON.parse(result.data.claim_external_ticket);
        if (resultObj.Status === "SUCCESS") {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            SnackbarText: "☑️ " + resultObj.Message,
          };
        }
        this.loading = false;
        this.DialogClaimStatusEmit(2);
      } catch (error) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "❎ Failed to claim ticket, try again",
        };
      }
      this.loading = false;
    },
    CancelClaim() {
      this.isClaiming = false;
      this.edited_claim_status = this.claim_status;
    },

    //Edit Ticket Methods
    async UpdateTicket() {
      this.loading = true;

      try {
        const input = { ticket_id: this.id };

        if (this.edited_title !== this.title) input.title = this.edited_title;
        if (this.edited_description !== this.description)
          input.description = this.edited_description;

        if (this.newUploadedFiles instanceof File) {
          const key = `tickets/${crypto.randomUUID()}_${
            this.newUploadedFiles.name
          }`;
          input.attachments = await uploadToS3(
            this.newUploadedFiles,
            this.orgDetails,
            key
          );
        }

        const result = await API.graphql(
          graphqlOperation(update_ticket, { input })
        );

        const resultObj = JSON.parse(result.data.update_ticket);

        if (resultObj.Status === "SUCCESS") {
          this.isEditing = false;
          this.DialogCreatedTicketDetailsEmit(2);
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            SnackbarText: "☑️ Ticket updated successfully!",
          };
        } else {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: "❎ " + resultObj.Message,
          };
        }
      } catch (e) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "❎ Failed to update ticket!",
        };
      }

      this.loading = false;
    },
    OpenEditMode() {
      this.isEditing = true;
      this.edited_title = this.title;
      this.edited_description = this.description;
      this.newUploadedFiles = null;
      if (this.attachments.length) {
        this.imagePreview = this.cacheBust(this.attachments[0]);
      }
    },
    CancelEdit() {
      this.isEditing = false;
      this.newUploadedFiles = null;
      this.imagePreview = this.attachments.length
        ? this.cacheBust(this.attachments[0])
        : null;
    },
    removeAttachment() {
      this.imagePreview = null;
      this.newUploadedFiles = null;
      this.attachments = [];
    },
    onNewFileSelected(input) {
      let file = null;

      if (Array.isArray(input)) {
        file = input[0];
      } else if (input instanceof File) {
        file = input;
      } else if (input?.target?.files?.length) {
        file = input.target.files[0];
      }

      if (!file || !(file instanceof Blob)) {
        this.newUploadedFiles = null;
        this.imagePreview = null;
        return;
      }

      this.newUploadedFiles = file;

      const reader = new FileReader();
      reader.onload = (e) => (this.imagePreview = e.target.result);
      reader.readAsDataURL(file);
    },

    //Edit Ticket Status Methods
    async UpdateTicketStatus() {
      this.loading = true;
      try {
        let input = {
          ticket_id: this.id,
          status: this.ticket_status,
          assigned_to_email: this.agents || this.assignee,
          due_date: Math.floor(new Date(this.enteredDate).getTime() / 1000),
        };
        if (
          this.ticket_status === "IN_PROGRESS" ||
          this.ticket_status === "ONHOLD" ||
          this.ticket_status === "REOPEN" ||
          this.ticket_status === "OPEN"
        ) {
          input.comment = this.resolution_note || "";
        }
        if (this.ticket_status === "RESOLVED") {
          input.resolution_note = this.resolution_note || "";
        }
        const result = await API.graphql(
          graphqlOperation(update_ticket, { input })
        );
        const resultObj = JSON.parse(result.data.update_ticket);
        if (resultObj.Status === "SUCCESS") {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            SnackbarText: "☑️ Ticket updated successfully!",
          };
          this.loading = false;
          this.updatingStatus = false;
          this.DialogCreatedTicketDetailsEmit(2);
        } else {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: "❎ " + resultObj.Message,
          };
        }
      } catch (error) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "❎ Failed updating ticket status.",
        };
      } finally {
        this.loading = false;
      }
    },
    OpenUpdateStatusMode() {
      this.updatingStatus = true;
    },
    allowedDates(enteredDate) {
      if (this.ticket_status === "RESOLVED") {
        const today = new Date();
        const d = new Date(enteredDate);
        return (
          d.getDate() === today.getDate() &&
          d.getMonth() === today.getMonth() &&
          d.getFullYear() === today.getFullYear()
        );
      }
      return new Date(enteredDate) >= new Date();
    },

    //Close/Reopen Ticket Status
    CloseReopenTicketMode() {
      this.closeReopenTicket = true;
    },
    cancelCloseReopen() {
      this.closeReopenTicket = false;
      this.ticket_status = this.ListAllCreatedTicketDetails.status;
    },

    //Delete Ticket
    async DeleteTicket() {
      if (!this.reason || this.reason.trim() === "") {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "❎ Deletion reason is required",
        };
        return;
      }
      this.loading = true;
      try {
        const result = await API.graphql(
          graphqlOperation(delete_ticket, {
            input: {
              ticket_id: this.StoreObj.ticket_id,
              deletion_reason: this.reason || "Deleted by user",
            },
          })
        );
        let resultObj = JSON.parse(result.data.delete_ticket);
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: resultObj.Status === "SUCCESS" ? "green" : "red",
          SnackbarText: "☑️ " + resultObj.Message,
        };
        this.loading = false;
        this.confirmDelete = false;
        this.reason = "";
        this.DialogCreatedTicketDetailsEmit(2);
      } catch (error) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "❎ Failed to delete ticket, try again",
        };
      }
      this.loading = false;
    },
    AskConfirm() {
      this.confirmDelete = true;
    },
    CancelDelete() {
      this.confirmDelete = false;
      this.reason = "";
    },
  },
};
</script>

<style scoped>
.settings-card {
  border-radius: 12px !important;
  transition: all 0.3s ease !important;
  cursor: pointer !important;
  background: white !important;
  border: 1px solid transparent !important;
}
.settings-card:hover {
  transform: translateY(-4px) !important;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
  border: 1px solid rgba(219, 76, 119, 0.2) !important;
}
.gradient-border-card {
  border: 1px solid rgba(0, 0, 0, 0.1) !important;
}
.overlay {
  background: rgba(255, 255, 255, 0.1) !important;
  backdrop-filter: blur(10px) !important;
  -webkit-backdrop-filter: blur(10px) !important;
  border-radius: 8px !important;
}
.hoverable-image {
  display: inline-block !important;
  cursor: zoom-in !important;
}
</style>
