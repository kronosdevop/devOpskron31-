<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <!-- eslint-disable -->
    <v-dialog
      :model-value="viewDetailsDialog"
      persistent
      fullscreen
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="1" dark density="compact" class="navBar">
          <v-avatar
            v-if="
              queryCheck == true && fetchUserInfo.user_profile_pic_url != 'N/A'
            "
            size="40"
            class="mt-1 mb-1 mr-3"
          >
            <v-img :src="fetchUserInfo.user_profile_pic_url" />
          </v-avatar>
          <v-toolbar-title class="text--black ml-2">
            <div class="custom-title text-h6 font-weight-medium">
              View Details of
              <span class="text-primary font-weight-bold">
                {{
                  fetchUserInfo.first_name +
                  " " +
                  (fetchUserInfo.last_name == undefined ||
                  fetchUserInfo.last_name == ""
                    ? ""
                    : fetchUserInfo.last_name)
                }}
              </span>
            </div>
          </v-toolbar-title>
          <v-spacer />

          <v-btn
            dark
            @click="edit_user_details()"
            :loading="loading"
            size="small"
            v-if="
              editfieldmember == true ||
              editdatejoin == true ||
              editfieldfirstName == true ||
              editfieldlastName == true ||
              editfieldcountry == true ||
              editfieldphone == true ||
              editdateconfirm == true ||
              editfielduanNo == true ||
              editfieldesi == true ||
              editterittory == true ||
              editfieldpersonalEmail == true
            "
            v-show="rowInfo.user_status != 'REMOVED'"
            class="text-capitalize mr-3 cardCss"
            prepend-icon="mdi-content-save"
            >Save</v-btn
          >
          <v-btn icon @click="close_dialog()" class="mr-2" size="small">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text class="pa-6">
          <v-row no-gutters class="mt-2">
            <v-col cols="6" class="pr-3">
              <v-card class="rounded-lg elevation-2 mb-4">
                <v-card-title
                  class="text-h6 font-weight-medium text-primary pb-2"
                >
                  <v-icon class="mr-2" color="primary"
                    >mdi-account-details</v-icon
                  >
                  Basic Details
                </v-card-title>
                <v-divider class="mx-4 mb-3"></v-divider>
                <v-card-text class="pt-0">
                  <v-form ref="form">
                    <v-row>
                      <v-col cols="6">
                        <v-row v-if="editfieldfirstName == true" class="ml-1">
                          <label
                            class="font-weight-bold mt-2 text-body-2 text-grey-darken-1"
                            >First Name :</label
                          ><br />
                          <v-text-field
                            variant="outlined"
                            density="compact"
                            :rules="[(v) => !!v || 'Required']"
                            style="max-width: 200px"
                            v-model="userFirstName"
                            class="caption font-weight-medium ml-2"
                            hide-details="auto"
                          />
                        </v-row>

                        <div v-if="editfieldfirstName == false" class="mb-3">
                          <label
                            class="font-weight-bold text-body-2 text-grey-darken-1"
                            >First Name</label
                          >
                          :<br />
                          <span class="text-body-1 font-weight-medium">
                            {{
                              userFirstName == "" || userFirstName == undefined
                                ? "N/A"
                                : userFirstName
                            }}</span
                          >
                          <v-icon
                            @click="openfirstnamedit()"
                            color="#DB4C77"
                            v-if="rowInfo.user_status != 'REMOVED'"
                            class="ml-2 cursor-pointer"
                            size="small"
                            >mdi-pencil</v-icon
                          >
                        </div>
                      </v-col>
                      <v-col cols="6">
                        <v-row v-if="editfieldlastName == true" class="ml-1">
                          <label class="font-weight-bold mt-2"
                            >Last Name :</label
                          ><br />
                          <v-text-field
                            variant="outlined"
                            density="compact"
                            style="max-width: 200px"
                            v-model="userLastName"
                            class="caption font-weight-medium ml-2"
                          />
                        </v-row>

                        <div v-if="editfieldlastName == false">
                          <label class="font-weight-bold">Last Name</label>
                          :<br />
                          <span>
                            {{
                              userLastName == "" || userLastName == undefined
                                ? "N/A"
                                : userLastName
                            }}</span
                          >
                          <v-icon
                            @click="openlastnamedit()"
                            color="#DB4C77"
                            size="small"
                            v-if="rowInfo.user_status != 'REMOVED'"
                            class="ml-1"
                            >mdi-pencil</v-icon
                          >
                        </div>
                      </v-col>
                      <v-col cols="6">
                        <v-row v-if="editfieldcountry == true" class="ml-1">
                          <label class="font-weight-bold mt-2"
                            >Country Code :</label
                          ><br />
                          <v-select
                            variant="outlined"
                            density="compact"
                            v-model="userCCode"
                            :items="countryitems"
                            class="mr-2 mt-1"
                            item-text="title"
                            item-value="code"
                          ></v-select>
                        </v-row>

                        <div v-if="editfieldcountry == false">
                          <label class="font-weight-bold">Country Code</label>
                          :<br />
                          <span>
                            {{
                              userCCode == "" || userCCode == undefined
                                ? "N/A"
                                : userCCode
                            }}</span
                          >
                          <v-icon
                            @click="opencountryedit()"
                            v-if="rowInfo.user_status != 'REMOVED'"
                            class="ml-1"
                            color="#DB4C77"
                            size="small"
                            >mdi-pencil</v-icon
                          >
                        </div>
                      </v-col>
                      <v-col cols="6">
                        <v-row v-if="editfieldphone == true" class="ml-1">
                          <label class="font-weight-bold mt-2"
                            >Phone Number :</label
                          ><br />
                          <v-text-field
                            variant="outlined"
                            density="compact"
                            v-model="userPhoneNo"
                            class=""
                            :rules="phoneRules"
                            maxlength="15"
                            v-on:keypress="is_Number($event)"
                          ></v-text-field>
                        </v-row>

                        <div v-if="editfieldphone == false">
                          <label class="font-weight-bold">Phone Number</label>
                          :<br />
                          <span>
                            {{
                              userPhoneNo == "" || userPhoneNo == undefined
                                ? "N/A"
                                : userPhoneNo
                            }}</span
                          >
                          <v-icon
                            @click="openphoneedit()"
                            v-if="rowInfo.user_status != 'REMOVED'"
                            class="ml-1"
                            color="#DB4C77"
                            size="small"
                            >mdi-pencil</v-icon
                          >
                        </div>
                      </v-col>
                      <v-col cols="6">
                        <div>
                          <label class="font-weight-bold">Email</label> :<br />
                          {{ basicEmail }}
                        </div>
                      </v-col>
                      <v-col cols="6">
                        <v-row
                          v-if="editfieldpersonalEmail == true"
                          class="ml-1"
                        >
                          <label class="font-weight-bold mt-2"
                            >Personal Email :</label
                          ><br />
                          <v-text-field
                            variant="outlined"
                            density="compact"
                            v-model="personalEmail"
                            class="caption font-weight-medium"
                            validate-on="input"
                            :rules="[
                              (v) =>
                                !v ||
                                /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(
                                  v
                                ) ||
                                'Enter a valid email address',
                            ]"
                            @keypress="preventSpace"
                          />
                        </v-row>

                        <div v-if="editfieldpersonalEmail == false">
                          <label class="font-weight-bold">Personal Email</label>
                          :<br />
                          <span>
                            {{
                              personalEmail == "" || personalEmail == undefined
                                ? "N/A"
                                : personalEmail
                            }}</span
                          >
                          <v-icon
                            @click="openpersonalEmailedit()"
                            v-if="rowInfo.user_status != 'REMOVED'"
                            class="ml-1"
                            color="#DB4C77"
                            size="small"
                            >mdi-pencil</v-icon
                          >
                        </div>
                      </v-col>
                    </v-row>
                  </v-form>
                </v-card-text>
              </v-card>
              <v-card class="rounded-lg elevation-2 mb-4">
                <v-card-title
                  class="text-h6 font-weight-medium text-primary pb-2"
                >
                  <v-icon class="mr-2" color="primary"
                    >mdi-account-heart</v-icon
                  >
                  Personal Details
                </v-card-title>
                <v-divider class="mx-4 mb-3"></v-divider>
                <v-card-text class="pt-0">
                  <v-row>
                    <v-col cols="6">
                      <div class="mb-3">
                        <label
                          class="font-weight-bold text-body-2 text-grey-darken-1"
                          >Gender</label
                        >
                        :<br />
                        <span class="text-body-1 font-weight-medium">{{
                          genderInfo
                        }}</span>
                      </div>
                    </v-col>
                    <v-col cols="6">
                      <div class="mb-3">
                        <label
                          class="font-weight-bold text-body-2 text-grey-darken-1"
                          >Date Of Birth</label
                        >
                        :<br />
                        <span class="text-body-1 font-weight-medium">
                          {{
                            dateOfBirth == ""
                              ? "N/A"
                              : convertDate(dateOfBirth)
                          }}
                        </span>
                      </div>
                    </v-col>
                    <v-col cols="6">
                      <div>
                        <label class="font-weight-bold">Blood Group</label>
                        :<br />
                        {{ bloodGroup }}
                      </div>
                    </v-col>
                    <v-col cols="6">
                      <div>
                        <label class="font-weight-bold">City/Area</label>
                        :<br />
                        {{ permanentCity }}
                      </div>
                    </v-col>
                    <v-col cols="6">
                      <div>
                        <label class="font-weight-bold"
                          >Alternate Country Code</label
                        >
                        :<br />
                        {{ alternateCCode }}
                      </div>
                    </v-col>
                    <v-col cols="6">
                      <div>
                        <label class="font-weight-bold"
                          >Alternate Phone Number</label
                        >
                        :<br />
                        {{ alternateContactNo }}
                      </div>
                    </v-col>
                    <v-col cols="6">
                      <div>
                        <label class="font-weight-bold">Country</label>
                        :<br />
                        {{ permanentCountry }}
                      </div>
                    </v-col>
                    <v-col cols="6">
                      <div>
                        <label class="font-weight-bold">Address Line 1</label>
                        :<br />
                        {{ addressLine1 }}
                      </div>
                    </v-col>
                    <v-col cols="6">
                      <div>
                        <label class="font-weight-bold">Address Line 2</label>
                        :<br />
                        {{ addressLine2 }}
                      </div>
                    </v-col>
                    <v-col cols="6">
                      <div>
                        <label class="font-weight-bold"
                          >Permanent Address</label
                        >
                        :<br />
                        {{ permanentAddress1 }}
                      </div>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
              <v-card class="rounded-lg elevation-2 mb-4">
                <v-card-title
                  class="text-h6 font-weight-medium text-primary pb-2"
                >
                  <v-icon class="mr-2" color="primary"
                    >mdi-card-account-details</v-icon
                  >
                  Membership Details
                </v-card-title>
                <v-divider class="mx-4 mb-3"></v-divider>
                <v-card-text class="pt-0">
                  <v-row>
                    <v-col cols="6">
                      <div class="mb-3">
                        <label
                          class="font-weight-bold text-body-2 text-grey-darken-1"
                          >Membership Type</label
                        >
                        :<br />
                        <span class="text-body-1 font-weight-medium">{{
                          memberShipType
                        }}</span>
                      </div>
                    </v-col>
                    <v-col cols="6">
                      <div class="mb-3">
                        <label
                          class="font-weight-bold text-body-2 text-grey-darken-1"
                          >Membership Start Date</label
                        >
                        :<br />
                        <span class="text-body-1 font-weight-medium">
                          {{
                            membershipStartDate == ""
                              ? "N/A"
                              : membershipStartDate
                          }}
                        </span>
                      </div>
                    </v-col>
                    <v-col cols="6">
                      <div class="mb-3">
                        <label
                          class="font-weight-bold text-body-2 text-grey-darken-1"
                          >Membership End Date</label
                        >
                        :<br />
                        <span class="text-body-1 font-weight-medium">
                          {{
                            membershipEndDate == "" ? "N/A" : membershipEndDate
                          }}
                        </span>
                      </div>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="6" class="pl-3">
              <v-card class="rounded-lg elevation-2 mb-4">
                <v-card-title
                  class="text-h6 font-weight-medium text-primary pb-2"
                >
                  <v-icon class="mr-2" color="primary">mdi-briefcase</v-icon>
                  Work Details
                </v-card-title>
                <v-divider class="mx-4 mb-3"></v-divider>
                <v-card-text class="pt-0">
                  <v-row>
                    <v-col cols="6">
                      <div class="mb-3">
                        <label
                          class="font-weight-bold text-body-2 text-grey-darken-1"
                          >Designation</label
                        >
                        :<br />
                        <span class="text-body-1 font-weight-medium">
                          {{
                            designationSelected == "" ||
                            designationSelected == undefined
                              ? "N/A"
                              : designationSelected
                          }}
                        </span>
                        <v-icon
                          @click="open_dialogs('designation')"
                          class="ml-2 cursor-pointer"
                          color="#DB4C77"
                          size="small"
                          v-if="rowInfo.user_status != 'REMOVED'"
                          >mdi-pencil</v-icon
                        >
                      </div>
                    </v-col>
                    <v-col cols="6">
                      <div class="mb-3">
                        <label
                          class="font-weight-bold text-body-2 text-grey-darken-1"
                          >Group</label
                        >
                        :<br />
                        <span class="text-body-1 font-weight-medium">
                          {{
                            departmentSelected == "" ||
                            departmentSelected == undefined
                              ? "N/A"
                              : departmentSelected
                          }}
                        </span>
                        <v-icon
                          @click="open_dialogs('departments')"
                          class="ml-2 cursor-pointer"
                          color="#DB4C77"
                          size="small"
                          v-if="rowInfo.user_status != 'REMOVED'"
                          >mdi-pencil</v-icon
                        >
                      </div>
                    </v-col>
                    <v-col cols="6">
                      <div>
                        <label class="font-weight-bold"
                          >Reporting Manager</label
                        >
                        :<br />
                        {{
                          reportingManager == "" ||
                          reportingManager == undefined
                            ? "N/A"
                            : reportingManager
                        }}
                        <v-icon
                          @click="open_dialogs('reportingManager')"
                          class="ml-1"
                          v-if="rowInfo.user_status != 'REMOVED'"
                          color="#DB4C77"
                          size="small"
                          >mdi-pencil</v-icon
                        >
                      </div>
                    </v-col>
                    <v-col cols="6">
                      <div>
                        <label class="font-weight-bold">Location</label> :<br />
                        {{
                          locationSelected == "" ||
                          locationSelected == undefined
                            ? "N/A"
                            : locationSelected
                        }}
                        <v-icon
                          @click="open_dialogs('locations')"
                          class="ml-1"
                          v-if="rowInfo.user_status != 'REMOVED'"
                          color="#DB4C77"
                          size="small"
                          >mdi-pencil</v-icon
                        >
                      </div>
                    </v-col>
                    <v-col cols="6">
                      <v-row v-if="editdatejoin == true" class="ml-1">
                        <label class="font-weight-bold mt-2"
                          >Date Of Joining :</label
                        ><br />
                        <v-menu
                          v-model="fromMenu"
                          :close-on-content-click="false"
                          transition="scale-transition"
                          offset-y
                          min-width="auto"
                        >
                          <template v-slot:activator="{ props }">
                            <v-text-field
                              :model-value="formatDateForDisplay(dateOfJoining)"
                              class="ml-2"
                              variant="outlined"
                              density="compact"
                              readonly
                              style="max-width: 130px"
                              v-bind="props"
                            ></v-text-field>
                          </template>
                          <v-date-picker
                            v-model="dateOfJoining"
                            no-title
                            scrollable
                            :max="new Date().toISOString().split('T')[0]"
                          >
                            <v-spacer></v-spacer>
                            <v-btn
                              text
                              color="primary"
                              @click="fromMenu = false"
                            >
                              Cancel
                            </v-btn>
                            <v-btn
                              text
                              color="primary"
                              @click="fromMenu = false"
                            >
                              OK
                            </v-btn>
                          </v-date-picker>
                        </v-menu>
                      </v-row>
                      <div v-if="editdatejoin == false">
                        <label class="font-weight-bold">Date Of Joining</label>
                        :<br />
                        {{
                          dateOfJoining == "" || dateOfJoining == undefined
                            ? "N/A"
                            : get_updatedate(dateOfJoining)
                        }}
                        <v-icon
                          @click="opendateofjoinredit()"
                          class="ml-1"
                          v-if="rowInfo.user_status != 'REMOVED'"
                          color="#DB4C77"
                          size="small"
                          >mdi-pencil</v-icon
                        >
                      </div>
                    </v-col>
                    <v-col cols="6">
                      <v-row v-if="editfieldmember == true" class="ml-1">
                        <label class="font-weight-bold mt-2">Member Id :</label
                        ><br />
                        <v-text-field
                          variant="outlined"
                          density="compact"
                          style="max-width: 100px"
                          v-model="memberId"
                          class="caption font-weight-medium ml-2"
                        />
                      </v-row>

                      <div v-if="editfieldmember == false">
                        <label class="font-weight-bold">Member Id</label>
                        :<br />
                        <span>
                          {{
                            memberId == "" || memberId == undefined
                              ? "N/A"
                              : memberId
                          }}</span
                        >
                        <v-icon
                          @click="openmemberedit()"
                          v-if="rowInfo.user_status != 'REMOVED'"
                          class="ml-1"
                          color="#DB4C77"
                          size="small"
                          >mdi-pencil</v-icon
                        >
                      </div>
                    </v-col>
                    <v-col cols="6">
                      <v-row v-if="editdateconfirm == true" class="ml-1">
                        <label class="font-weight-bold mt-2"
                          >Date Of Confirmation :</label
                        ><br />
                        <v-menu
                          v-model="confirmMenu"
                          :close-on-content-click="false"
                          transition="scale-transition"
                          offset-y
                          min-width="auto"
                        >
                          <template v-slot:activator="{ props }">
                            <v-text-field
                              :model-value="formatDateForDisplay(dateOfconfirm)"
                              variant="outlined"
                              density="compact"
                              class="ml-2"
                              readonly
                              style="max-width: 130px"
                              v-bind="props"
                            ></v-text-field>
                          </template>
                          <v-date-picker
                            v-model="dateOfconfirm"
                            no-title
                            scrollable
                            :max="new Date().toISOString().split('T')[0]"
                          >
                            <v-spacer></v-spacer>
                            <v-btn
                              text
                              color="primary"
                              @click="confirmMenu = false"
                            >
                              Cancel
                            </v-btn>
                            <v-btn
                              text
                              color="primary"
                              @click="confirmMenu = false"
                            >
                              OK
                            </v-btn>
                          </v-date-picker>
                        </v-menu>
                      </v-row>
                      <div v-if="editdateconfirm == false">
                        <label class="font-weight-bold"
                          >Date Of Confirmation</label
                        >
                        :<br />
                        {{
                          dateOfconfirm == "" || dateOfconfirm == undefined
                            ? "N/A"
                            : get_updatedate(dateOfconfirm)
                        }}
                        <v-icon
                          @click="openeditdateconfirmedit()"
                          class="ml-1"
                          v-if="rowInfo.user_status != 'REMOVED'"
                          color="#DB4C77"
                          size="small"
                          >mdi-pencil</v-icon
                        >
                      </div>
                    </v-col>
                    <v-col
                      cols="6"
                      v-if="dateOfconfirm && dateOfconfirm !== ''"
                    >
                      <div class="mb-3">
                        <label
                          class="font-weight-bold text-body-2 text-grey-darken-1"
                          >Experience</label
                        >
                        :<br />
                        <span class="text-body-1 font-weight-medium">
                          <v-icon size="16" color="success" class="mr-2"
                            >mdi-clock-time-four</v-icon
                          >
                          {{ calculateExperience(dateOfconfirm) }}
                        </span>
                      </div>
                    </v-col>
                    <v-col cols="6">
                      <v-row v-if="editfielduanNo == true" class="ml-1">
                        <label class="font-weight-bold mt-2">UAN Number :</label
                        ><br />
                        <v-text-field
                          variant="outlined"
                          density="compact"
                          style="max-width: 100px"
                          v-model="uanNumber"
                          class="caption font-weight-medium ml-2"
                        />
                      </v-row>

                      <div v-if="editfielduanNo == false">
                        <label class="font-weight-bold">UAN Number</label>
                        :<br />
                        <span>
                          {{
                            uanNumber == "" || uanNumber == undefined
                              ? "N/A"
                              : uanNumber
                          }}</span
                        >
                        <v-icon
                          @click="openuanedit()"
                          v-if="rowInfo.user_status != 'REMOVED'"
                          class="ml-1"
                          color="#DB4C77"
                          size="small"
                          >mdi-pencil</v-icon
                        >
                      </div>
                    </v-col>
                    <v-col cols="6">
                      <v-row v-if="editfieldesi == true" class="ml-1">
                        <label class="font-weight-bold mt-2">ESI Number :</label
                        ><br />
                        <v-text-field
                          variant="outlined"
                          density="compact"
                          style="max-width: 100px"
                          v-model="esiNumber"
                          class="caption font-weight-medium ml-2"
                        />
                      </v-row>

                      <div v-if="editfieldesi == false">
                        <label class="font-weight-bold">ESI Number</label>
                        :<br />
                        <span>
                          {{
                            esiNumber == "" || esiNumber == undefined
                              ? "N/A"
                              : esiNumber
                          }}</span
                        >
                        <v-icon
                          @click="openesiedit()"
                          v-if="rowInfo.user_status != 'REMOVED'"
                          class="ml-1"
                          color="#DB4C77"
                          size="small"
                          >mdi-pencil</v-icon
                        >
                      </div>
                    </v-col>
                    <v-col cols="6">
                      <v-row v-if="editterittory == true" class="ml-1">
                        <label class="font-weight-bold mt-2">Territory :</label
                        ><br />
                        <v-autocomplete
                          variant="outlined"
                          density="compact"
                          v-model="terittoryName"
                          label="Territory"
                          :items="territoryArray"
                          class="caption font-weight-medium ml-2"
                          item-text="title"
                          item-value="Value"
                          style="max-width: 200px"
                          @input="searchT = ''"
                          :search-input.sync="searchT"
                        ></v-autocomplete>
                      </v-row>

                      <div v-if="editterittory == false">
                        <label class="font-weight-bold">Territory</label>
                        :<br />
                        <span>
                          {{
                            terittorydisplayName == "" ||
                            terittorydisplayName == undefined
                              ? "N/A"
                              : terittorydisplayName
                          }}</span
                        >
                        <v-icon
                          @click="openterittoryedit()"
                          v-if="rowInfo.user_status != 'REMOVED'"
                          class="ml-1"
                          color="#DB4C77"
                          size="small"
                          >mdi-pencil</v-icon
                        >
                      </div>
                    </v-col>
                    <!-- <v-col cols="6">
                      <div>
                        <label class="font-weight-bold"
                          >Social Media Profile</label
                        >
                        :
                        {{ linkedinUrl }}
                      </div>
                    </v-col> -->
                  </v-row>
                </v-card-text>
              </v-card>
              <v-card class="rounded-lg elevation-2 mb-4">
                <v-card-title
                  class="text-h6 font-weight-medium text-primary pb-2"
                >
                  <v-icon class="mr-2" color="primary"
                    >mdi-card-account-details-outline</v-icon
                  >
                  Identity Details
                </v-card-title>
                <v-divider class="mx-4 mb-3"></v-divider>
                <v-card-text class="pt-0">
                  <v-row>
                    <v-col cols="6">
                      <div class="mb-3">
                        <label
                          class="font-weight-bold text-body-2 text-grey-darken-1"
                          >Nationality</label
                        >
                        :<br />
                        <span class="text-body-1 font-weight-medium">{{
                          nationalityIdentity
                        }}</span>
                      </div>
                    </v-col>
                    <v-col cols="6">
                      <div class="mb-3">
                        <label
                          class="font-weight-bold text-body-2 text-grey-darken-1"
                          >Passport Number</label
                        >
                        :<br />
                        <span class="text-body-1 font-weight-medium">{{
                          passportNumber
                        }}</span>
                      </div>
                    </v-col>
                    <v-col cols="6">
                      <div class="mb-3">
                        <label
                          class="font-weight-bold text-body-2 text-grey-darken-1"
                          >Passport Expiry Date</label
                        >
                        :<br />
                        <span class="text-body-1 font-weight-medium">{{
                          expiryDate == "" || expiryDate == undefined
                            ? "N/A"
                            : get_updatedate(expiryDate)
                        }}</span>
                      </div>
                    </v-col>
                    <v-col cols="6">
                      <div class="mb-3">
                        <label
                          class="font-weight-bold text-body-2 text-grey-darken-1"
                          >Insurance Name</label
                        >
                        :<br />
                        <span class="text-body-1 font-weight-medium">{{
                          insuranceName
                        }}</span>
                      </div>
                    </v-col>
                    <v-col cols="6">
                      <div class="mb-3">
                        <label
                          class="font-weight-bold text-body-2 text-grey-darken-1"
                          >Insurance Id</label
                        >
                        :<br />
                        <span class="text-body-1 font-weight-medium">{{
                          insuranceId
                        }}</span>
                      </div>
                    </v-col>
                    <v-col cols="6">
                      <div class="mb-3">
                        <label
                          class="font-weight-bold text-body-2 text-grey-darken-1"
                          >Insurance Expiry Date</label
                        >
                        :<br />
                        <span class="text-body-1 font-weight-medium">{{
                          insuranceExipiryDate == ""
                            ? "N/A"
                            : get_updatedate(insuranceExipiryDate)
                        }}</span>
                      </div>
                    </v-col>
                    <v-col cols="6">
                      <div class="mb-3">
                        <label
                          class="font-weight-bold text-body-2 text-grey-darken-1"
                          >Government Id Number</label
                        >
                        :<br />
                        <span class="text-body-1 font-weight-medium">{{
                          govtIdNumber
                        }}</span>
                      </div>
                    </v-col>
                    <v-col cols="6">
                      <div class="mb-3">
                        <label
                          class="font-weight-bold text-body-2 text-grey-darken-1"
                          >Driving Licence ID</label
                        >
                        :<br />
                        <span class="text-body-1 font-weight-medium">{{
                          drivingId == "" ? "N/A" : drivingId
                        }}</span>
                      </div>
                    </v-col>
                    <v-col cols="6">
                      <div class="mb-3">
                        <label
                          class="font-weight-bold text-body-2 text-grey-darken-1"
                          >Driving Expiry Date</label
                        >
                        :<br />
                        <span class="text-body-1 font-weight-medium">{{
                          drivingExpiryDate == ""
                            ? "N/A"
                            : get_updatedate(drivingExpiryDate)
                        }}</span>
                      </div>
                    </v-col>
                    <v-col cols="6">
                      <div class="mb-3">
                        <label
                          class="font-weight-bold text-body-2 text-grey-darken-1"
                          >Aadhaar Number</label
                        >
                        :<br />
                        <span class="text-body-1 font-weight-medium">{{
                          aadhaarNumber == "" ? "N/A" : aadhaarNumber
                        }}</span>
                      </div>
                    </v-col>
                    <v-col cols="6">
                      <div class="mb-3">
                        <label
                          class="font-weight-bold text-body-2 text-grey-darken-1"
                          >Pan Number</label
                        >
                        :<br />
                        <span class="text-body-1 font-weight-medium">{{
                          panNumber == "" ? "N/A" : panNumber
                        }}</span>
                      </div>
                    </v-col>
                    <v-col cols="6">
                      <div class="mb-3">
                        <label
                          class="font-weight-bold text-body-2 text-grey-darken-1"
                          >Bank Account Number</label
                        >
                        :<br />
                        <span class="text-body-1 font-weight-medium">{{
                          bankackNumber == "" ? "N/A" : bankackNumber
                        }}</span>
                      </div>
                    </v-col>
                    <v-col cols="6">
                      <div class="mb-3">
                        <label
                          class="font-weight-bold text-body-2 text-grey-darken-1"
                          >IFSC Code</label
                        >
                        :<br />
                        <span class="text-body-1 font-weight-medium">{{
                          ifscCode == "" ? "N/A" : ifscCode
                        }}</span>
                      </div>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="justify-end"> </v-card-actions>
      </v-card>
    </v-dialog>
    <div v-if="componentCheck == 1">
      <ChangeDesignation
        :designationChange="designationChange"
        @clicked="designationChange = false"
        :rowInfo="rowInfo"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
    <div v-if="componentCheck == 2">
      <ChangeDepertment
        :depertmentchange="depertmentchange"
        @clicked="depertmentchange = false"
        :rowInfo="rowInfo"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>

    <div v-if="componentCheck == 3">
      <ChangeRM
        :changeManger="changeManger"
        @clicked="changeManger = false"
        :rowInfo="rowInfo"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
    <div v-if="componentCheck == 4">
      <ChnageLocation
        :locationChange="locationChange"
        @clicked="locationChange = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        :rowInfo="rowInfo"
      />
    </div>
    <OverlayComp :overlay="overlay" />
  </div>
</template>
<script>
/* eslint-disable */
import { formatdisplayDate } from "@/JsonFiles/DateFormate.js";
import { get_master_terittory } from "@/mixins/GetMasterTerritory";
import CountryList from "@/JsonFiles/CountryList.json";
import { get_selected_user_details } from "@/mixins/GetUserDetails.js";
import { get_member_details } from "@/mixins/GetMemberships.js";
import { get_designations_details } from "@/mixins/GetDesignations.js";
import { get_department_details } from "@/mixins/GetDepartments.js";
import { get_location_details } from "@/mixins/GetLocations.js";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import ChangeDepertment from "@/components/StaticForms/ChangeDepertment.vue";
import ChnageLocation from "@/components/StaticForms/ChnageLocation.vue";
import ChangeRM from "@/components/StaticForms/ChangeRM.vue";
import ChangeDesignation from "@/components/StaticForms/ChangeDesignation.vue";
import SnackBar from "@/components/SnackBar.vue";
import OverlayComp from "@/components/OverlayComp.vue";
// import { update_audit_logs } from "@/mixins/AuditLogActions.js";
var axios = require("axios");
export default {
  props: {
    viewDetailsDialog: Boolean,
    rowInfo: Object,
  },
  components: {
    SnackBar,
    ChangeDepertment,
    ChnageLocation,
    ChangeRM,
    ChangeDesignation,
    OverlayComp,
    CountryList,
  },
  mixins: [
    get_selected_user_details,
    get_member_details,
    get_designations_details,
    get_department_details,
    get_location_details,
    get_all_org_users,
    get_master_terittory,
    // update_audit_logs,
  ],
  data() {
    return {
      SnackBarComponent: {},
      terittorydisplayName: "",
      userFirstName: "",
      editfieldfirstName: false,
      userLastName: "",
      territoryArray: [],
      userCCode: "",
      basicEmail: "",
      userPhoneNo: "",
      countryCodes: [],
      personalEmail: "",
      genderInfo: "",
      menu: false,
      dateOfBirth: "",
      bloodGroup: "",
      alternateCCode: "",
      alternateContactNo: "",
      permanentCity: "",
      permanentCountry: "",
      addressLine1: "",
      addressLine2: "",
      permanentAddress1: "",
      countriesData: [],
      modal2: false,
      modal1: false,
      membershipEndDate: "",
      memberShipType: "",
      membershipStartDate: "",
      membershipEndDate: "",
      membershipitems: [],
      activePicker: null,
      designationSelected: "",
      designations: [],
      departmentSelected: "",
      departments: [],
      memberId: "",
      uanNumber: "",
      esiNumber: "",
      locationSelected: "",
      locations: [],
      reportingManager: "",
      reportTo: [],
      dateOfJoining: "",
      dateOfconfirm: "",
      searchT: "",
      linkedinUrl: "",
      nationalityIdentity: "",
      passportNumber: "",
      expiryDate: "",
      govtIdNumber: "",
      insuranceName: "",
      insuranceId: "",
      modal: false,
      date: null,
      countryitems: [],
      componentCheck: 0,
      designationChange: false,
      locationChange: false,
      depertmentchange: false,
      changeManger: false,
      search: "",
      overlay: false,
      loading: false,
      queryCheck: false,
      minDate: new Date().toISOString().split("T")[0],
      accountId: "",
      monthlySlary: "",
      status: "",
      drivingExpiryDate: "",
      aadhaarNumber: "",
      panNumber: "",
      ifscCode: "",
      bankackNumber: "",
      terittoryName: "",
      drivingId: "",
      insuranceExipiryDate: "",
      editfieldmember: false,
      editfielduanNo: false,
      editfieldesi: false,
      editterittory: false,
      editdatejoin: false,
      editdateconfirm: false,
      editfieldlastName: false,
      editfieldcountry: false,
      editfieldphone: false,
      editfieldpersonalEmail: false,
      phoneRules: [
        (v) =>
          v.length === 0 ||
          (v.length >= 8 && v.length <= 15) ||
          "Phone number must be between 8 and 15 characters",
      ],
      fromMenu: false,
      confirmMenu: false,
    };
  },
  watch: {
    viewDetailsDialog: {
      menu(val) {
        val && setTimeout(() => (this.activePicker = "YEAR"));
      },
      async handler() {
        if (this.viewDetailsDialog == true) {
          this.status =
            this.rowInfo.user_status == "JOINED"
              ? "ACTIVE"
              : this.rowInfo.user_status == "REMOVED"
              ? "DEACTIVE"
              : this.rowInfo.user_status;
          this.overlay = true;
          this.editdatejoin = false;
          this.editdateconfirm = false;
          this.editfieldphone = false;
          this.editfieldcountry = false;
          this.editfieldlastName = false;
          this.editfieldpersonalEmail = false;
          this.editfieldfirstName = false;
          this.editfieldfirstName = false;
          this.editfielduanNo = false;
          this.editfieldesi = false;
          this.editterittory = false;
          this.editfieldmember = false;
          await this.get_selected_user_details(this.status);
          await this.get_member_details();
          this.countryitems = [];
          CountryList.forEach((element) => {
            this.countryitems.push({
              title: element.name + "(" + element.dial_code + ")",
              code: element.dial_code,
            });
          });
          this.queryCheck = true;
          this.overlay = false;
          this.countries();
          await this.get_master_terittory();
          this.fetch_details();
          this.get_master_detials();
          this.fetch_default_values();
        }
      },
      immediate: true,
    },
  },
  methods: {
    preventSpace(event) {
      if (event.key === " ") {
        event.preventDefault();
      }
    },
    get_updatedate(date) {
      return formatdisplayDate(date);
    },
    convertDate(dateOfBirth) {
      const date = new Date(dateOfBirth);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate())}`
    },
    opencountryedit() {
      this.editfieldcountry = true;
      if (this.userCCode == "N/A" || this.userCCode == undefined) {
        this.userCCode = "";
      }
    },
    openphoneedit() {
      this.editfieldphone = true;
      if (this.userPhoneNo == "N/A" || this.userPhoneNo == undefined) {
        this.userPhoneNo = "";
      }
    },
    openfirstnamedit() {
      this.editfieldfirstName = true;
    },
    openlastnamedit() {
      this.editfieldlastName = true;
    },
    openpersonalEmailedit() {
      this.personalEmail = "";
      this.editfieldpersonalEmail = true;
    },
    openmemberedit() {
      this.editfieldmember = true;
    },
    openuanedit() {
      this.editfielduanNo = true;
    },
    openesiedit() {
      this.editfieldesi = true;
    },
    openterittoryedit() {
      this.editterittory = true;
    },

    is_Number(evt) {
      evt = evt ? evt : window.event;
      var charCode = evt.which ? evt.which : evt.keyCode;
      if (
        charCode > 31 &&
        (charCode < 48 || charCode > 57) &&
        charCode !== 46
      ) {
        evt.preventDefault();
      } else {
        return true;
      }
    },
    opendateofjoinredit() {
      this.editdatejoin = true;
    },
    openeditdateconfirmedit() {
      this.editdateconfirm = true;
    },
    fetch_default_values() {
      this.userFirstName = this.fetchUserInfo.first_name;
      this.userLastName = this.fetchUserInfo.last_name;
      this.userCCode = this.fetchUserInfo.user_country_code;
      this.basicEmail = this.fetchUserInfo.user_email_id;
      this.personalEmail = this.fetchUserInfo.personal_email;
      this.userPhoneNo = this.fetchUserInfo.user_contact_number;
      this.genderInfo = this.fetchUserInfo.gender;
      this.permanentAddress1 = this.fetchUserInfo.permanent_address;
      this.permanentCity = this.fetchUserInfo.city;
      this.permanentCountry = this.fetchUserInfo.country;
      this.addressLine2 = this.fetchUserInfo.address_2;
      this.addressLine1 = this.fetchUserInfo.address_1;
      this.dateOfBirth =
        this.fetchUserInfo.date_of_birth == "N/A"
          ? ""
          : this.fetchUserInfo.date_of_birth;
      this.bloodGroup = this.fetchUserInfo.blood_group;
      this.alternateCCode = this.fetchUserInfo.alternative_country_code;
      this.alternateContactNo = this.fetchUserInfo.alternative_contact_number;
      this.memberShipType = this.fetchUserInfo.membership_type;
      this.terittoryName =
        this.fetchUserInfo.territory_id == undefined
          ? ""
          : this.fetchUserInfo.territory_id;
      this.terittorydisplayName =
        this.fetchUserInfo.territory_name == undefined
          ? ""
          : this.fetchUserInfo.territory_name;
      this.membershipStartDate =
        this.fetchUserInfo.membership_start_date == "N/A"
          ? ""
          : this.fetchUserInfo.membership_start_date;

      this.membershipEndDate =
        this.fetchUserInfo.membership_end_date == "N/A"
          ? ""
          : this.fetchUserInfo.membership_end_date;
      this.designationSelected = this.fetchUserInfo.designation_name;
      this.departmentSelected = this.fetchUserInfo.department_name;
      this.memberId = this.fetchUserInfo.member_id;
      this.reportingManager = this.fetchUserInfo.reporting_manager_name;
      this.linkedinUrl = this.fetchUserInfo.social_media;
      var dateOfJoining = this.fetchUserInfo.date_of_joining; // Replace with your actual variable

      if (dateOfJoining && dateOfJoining !== "N/A" && dateOfJoining !== "-") {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfJoining)) {
          this.dateOfJoining = "";
        } else {
          this.dateOfJoining = dateOfJoining;
        }
      } else {
        this.dateOfJoining = "";
      }

      var dateOfconfirm =
        this.fetchUserInfo.date_of_confirmation == undefined
          ? ""
          : this.fetchUserInfo.date_of_confirmation; // Replace with your actual variable

      if (dateOfconfirm && dateOfconfirm !== "N/A" && dateOfconfirm !== "-") {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfconfirm)) {
          this.dateOfconfirm = "";
        } else {
          this.dateOfconfirm = dateOfconfirm;
        }
      } else {
        this.dateOfconfirm = "";
      }
      // this.dateOfJoining =
      //   ["N/A", "-", undefined].indexOf(this.fetchUserInfo.date_of_joining) >
      //   -1
      //     ? ""
      //     : this.fetchUserInfo.date_of_joining;

      this.nationalityIdentity = this.fetchUserInfo.nationality;
      this.passportNumber = this.fetchUserInfo.identity_number;
      this.expiryDate =
        this.fetchUserInfo.identity_expiry_date == "N/A"
          ? ""
          : this.fetchUserInfo.identity_expiry_date;

      this.govtIdNumber = this.fetchUserInfo.government_id;
      this.insuranceName = this.fetchUserInfo.insurance_name;
      this.insuranceId = this.fetchUserInfo.insurance_id;
      this.locationSelected = this.fetchUserInfo.location;
      this.aadhaarNumber = this.fetchUserInfo.adhar_number;
      this.panNumber = this.fetchUserInfo.pan_number;
      this.uanNumber = this.fetchUserInfo.uan_number;
      this.esiNumber = this.fetchUserInfo.esi_number;
      this.bankackNumber = this.fetchUserInfo.bank_account_number;
      this.ifscCode = this.fetchUserInfo.bank_ifsc_code;
    },
    countries() {
      var countryccWithIso = [];
      this.countriesData = [];
      var countryWithCc = [];
      CountryList.forEach((element) => {
        countryWithCc.push({
          title: element.name + "(" + element.dial_code + ")",
          value: element.dial_code,
        });
        this.countriesData.push(element.name);
      });

      var countryListt = countryWithCc;
      this.countryCodes = countryListt;
    },
    validateURL(url) {
      if (url != "") {
        const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
        return urlRegex.test(url);
      }
    },
    fetch_details() {
      this.membershipDeatils.forEach((element) => {
        this.membershipitems.push({
          membership_types: element.membership_name,
          membership_id: element.membership_id,
        });
      });
      this.orgTerittory.forEach((element) => {
        this.territoryArray.push({
          title: element.territory_name,
          Value: element.territory_id,
        });
      });
    },

    get_master_detials() {
      this.designations = [];
      this.departments = [];
      this.locations = [];
      this.reportTo = [];
      this.orgUsers.forEach((element) => {
        if (
          element.user_type != "CHATBOT" &&
          element.user_status != "DEACTIVE"
        ) {
          this.reportTo.push({
            title: element.full_user_name,
            Value: element.user_id,
          });
        }
      });
      this.designationList.forEach((element) => {
        this.designations.push({
          title: element.designation_name,
          Value: element.designation_id,
        });
      });

      this.departmentList.forEach((element) => {
        this.departments.push({
          title: element.department_name,
          Value: element.department_name,
        });
      });
      this.locationList.forEach((element) => {
        this.locations.push({
          title: element.location_name,
          Value: element.location_name,
        });
      });
    },
    close_dialog() {
      // Reset form fields to empty
      this.userCCode = "";
      this.userPhoneNo = "";
      this.userFirstName = "";
      this.userLastName = "";
      this.personalEmail = "";
      this.memberId = "";
      this.uanNumber = "";
      this.esiNumber = "";
      this.terittoryName = "";
      this.dateOfJoining = "";
      this.dateOfconfirm = "";

      // Reset edit states
      this.editfieldfirstName = false;
      this.editfieldlastName = false;
      this.editfieldcountry = false;
      this.editfieldphone = false;
      this.editfieldpersonalEmail = false;
      this.editfieldmember = false;
      this.editfielduanNo = false;
      this.editfieldesi = false;
      this.editterittory = false;
      this.editdatejoin = false;
      this.editdateconfirm = false;

      // Emit close event
      this.$emit("clicked", 0);
    },
    open_dialogs(value) {
      switch (value) {
        case "designation":
          this.componentCheck = 1;
          this.designationChange = true;
          break;
        case "departments":
          this.componentCheck = 2;
          this.depertmentchange = true;

          break;
        case "reportingManager":
          this.componentCheck = 3;
          this.changeManger = true;
          break;
        case "locations":
          this.componentCheck = 4;
          this.locationChange = true;
          break;

        default:
          break;
      }
    },
    error_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "red",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
    },

    async success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.locationChange = false;
      this.depertmentchange = false;
      this.designationChange = false;
      this.changeManger = false;
      this.$emit("clicked", 0);
      // await this.get_selected_user_details();
      // this.fetch_default_values();
    },

    is_Number(evt) {
      evt = evt ? evt : window.event;
      var charCode = evt.which ? evt.which : evt.keyCode;
      if (
        charCode > 31 &&
        (charCode < 48 || charCode > 57) &&
        charCode !== 46
      ) {
        evt.preventDefault();
      } else {
        return true;
      }
    },
    async calluseupdate() {
      this.loading = true;

      axios({
        method: "post",
        maxBodyLength: Infinity,

        url: "https://sn3ezxtgcc.execute-api.us-east-1.amazonaws.com/dev/workflow_respective_initiate",
        headers: {
          "x-api-key":
            this.$store.getters.GetOrgDetails.organization["x-api-key"],
          "Content-Type": "application/json",
        },
        data: {
          command: "customInitiatesWorkflows",
          action_type: "UPDATE_PROFILE",
          current_user_email_id:
            this.$store.getters.GetUserObj.user.user_email_id,
          organization_id:
            this.$store.getters.GetUserObj.organization.organization_id,
          first_name: this.userFirstName,
          last_name: this.userLastName == "" ? "N/A" : this.userLastName,
          user_email_id: this.basicEmail,
          personal_email: this.personalEmail == "" ? "N/A" : this.personalEmail,
          user_contact_number:
            this.userPhoneNo == "" ? "N/A" : this.userPhoneNo,
          user_country_code:
            this.userPhoneNo == "" || this.userPhoneNo == "N/A"
              ? "N/A"
              : this.userCCode,
          department: this.fetchUserInfo.department,
          designation: this.fetchUserInfo.designation,
          location: this.locationSelected,
          location_id: this.fetchUserInfo.location_id,
          reporting_manager: this.fetchUserInfo.reporting_manager,
          date_of_joining:
            this.dateOfJoining == ""
              ? undefined
              : this.formatDateForDisplayConfirm(this.dateOfJoining),
          social_media: this.linkedinUrl == "" ? undefined : this.linkedinUrl,
          blood_group: this.bloodGroup == "" ? undefined : this.bloodGroup,
          date_of_birth: this.dateOfBirth == "" ? undefined : this.dateOfBirth,
          alternative_country_code:
            this.alternateCCode == "" ? undefined : this.alternateCCode,
          alternative_contact_number:
            this.alternateContactNo == "" ? undefined : this.alternateContactNo,
          address_1: this.addressLine1 == "" ? undefined : this.addressLine1,
          address_2: this.addressLine2 == "" ? undefined : this.addressLine2,
          city: this.permanentCity == "" ? undefined : this.permanentCity,
          state:
            this.permanentCountry == "" ? undefined : this.permanentCountry,
          country:
            this.permanentCountry == "" ? undefined : this.permanentCountry,
          permanent_details:
            this.permanentAddress1 == "" ? undefined : this.permanentAddress1,
          nationality:
            this.nationalityIdentity == ""
              ? undefined
              : this.nationalityIdentity,
          identity_number:
            this.passportNumber == "" ? undefined : this.passportNumber,
          identity_expiry_date:
            this.expiryDate == "" ? undefined : this.expiryDate,
          government_id:
            this.govtIdNumber == "" ? undefined : this.govtIdNumber,
          insurance_name:
            this.insuranceName == "" ? undefined : this.insuranceName,
          insurance_id: this.insuranceId == "" ? undefined : this.insuranceId,
          membership_type:
            this.memberShipType == "" ? undefined : this.memberShipType,
          membership_start_date:
            this.membershipStartDate == ""
              ? undefined
              : this.membershipStartDate,
          membership_end_date:
            this.membershipEndDate == "" ? undefined : this.membershipEndDate,
          gender: this.genderInfo == "" ? undefined : this.genderInfo,
          member_id: this.memberId,
          date_of_confirmation:
            this.dateOfconfirm == ""
              ? undefined
              : this.formatDateForDisplayConfirm(this.dateOfconfirm),
          adhar_number:
            this.aadhaarNumber == "" ? undefined : this.aadhaarNumber,
          pan_number: this.panNumber == "" ? undefined : this.panNumber,
          uan_number: this.uanNumber == "" ? undefined : this.uanNumber,
          esi_number: this.esiNumber == "" ? undefined : this.esiNumber,
          bank_account_number:
            this.bankackNumber == "" ? undefined : this.bankackNumber,
          bank_ifsc_code: this.ifscCode == "" ? undefined : this.ifscCode,
          territory_id:
            this.terittoryName == "" ? undefined : this.terittoryName,
        },
      })
        .then((res) => {
          if (res.data.Status == "SUCCESS") {
            this.loading = false;
            this.SnackBarComponent = {
              SnackbarVmodel: true,
              SnackbarColor: "green",
              SnackbarText: "Updated Successfully",
              timeout: 5000,
              Top: true,
            };
            this.get_selected_user_details();
            this.fetch_details();
            // this.fetch_audit_message();
            this.$emit("clicked", 0);
            // this.$emit("successMsg", res.data.Message);
          } else {
            this.loading = false;
            this.SnackBarComponent = {
              SnackbarVmodel: true,
              SnackbarColor: "red",
              SnackbarText: res.data.Message,
              timeout: 5000,
              Top: true,
            };
            // this.$emit("errorMsg", res.data.Message);
          }
        })
        .catch(() => {
          this.loading = false;
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: error.errors[0].message,
            timeout: 5000,
            Top: true,
          };
          // this.$emit("errorMsg", error.errors[0].message);
        });
    },
    async edit_user_details() {
      if (this.$refs.form.validate()) {
        if (this.userPhoneNo != "" && this.userPhoneNo != "N/A") {
          if (this.userCCode == "N/A" || this.userCCode == "") {
            this.$emit("errorMsg", "Select the Country Code");
          } else {
            // this.$refs.emailField.resetValidation();
            await this.calluseupdate();
          }
        } else {
          await this.calluseupdate();
        }
      }
    },
    async fetch_audit_message() {
      var data = this.$store.getters.GetUserObj;
      var data = {
        AuditType: "WORKFLOW_ACTION",
        AuditAction: "UPDATE_PROFILE",
        AuditMessage: `${data.user.full_user_name} initiated Updated Profile Workflow`,
      };

      this.$store.commit("SetAuditActions", data);
      // this.update_audit_logs();
    },
    formatDateForDisplay(date) {
      if (date) {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
      }
      return "";
    },
    formatDateForDisplayConfirm(date) {
      if (date) {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();
        return `${year}-${month}-${day}`;
      }
      return "";
    },
    calculateExperience(confirmationDate) {
      if (!confirmationDate) return "N/A";

      try {
        const confirmDate = new Date(confirmationDate);
        const today = new Date();

        // Check if confirmation date is valid and not in the future
        if (isNaN(confirmDate.getTime()) || confirmDate > today) {
          return "N/A";
        }

        // Calculate difference in months
        let months = (today.getFullYear() - confirmDate.getFullYear()) * 12;
        months += today.getMonth() - confirmDate.getMonth();

        // Adjust for day of month
        if (today.getDate() < confirmDate.getDate()) {
          months--;
        }

        // Convert to years and months
        const years = Math.floor(months / 12);
        const remainingMonths = months % 12;

        // Format the result
        if (years === 0) {
          return `${remainingMonths} month${remainingMonths !== 1 ? "s" : ""}`;
        } else if (remainingMonths === 0) {
          return `${years} year${years !== 1 ? "s" : ""}`;
        } else {
          return `${years} year${
            years !== 1 ? "s" : ""
          } ${remainingMonths} month${remainingMonths !== 1 ? "s" : ""}`;
        }
      } catch (error) {
        console.error("Error calculating experience:", error);
        return "N/A";
      }
    },
  },
};
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
  transition: all 0.2s ease;
}

.cursor-pointer:hover {
  transform: scale(1.1);
  color: #1976d2 !important;
}

.v-card {
  transition: all 0.3s ease;
}

.v-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
}

.v-card-title {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  margin: -16px -16px 0 -16px;
  padding: 16px;
  border-radius: 8px 8px 0 0;
}

.text-primary {
  color: #1976d2 !important;
}

.v-text-field {
  transition: all 0.2s ease;
}

.v-text-field:focus-within {
  transform: scale(1.02);
}

.v-btn {
  transition: all 0.2s ease;
}

.v-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.v-avatar {
  border: 3px solid white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.v-divider {
  opacity: 0.3;
}

.text-grey-darken-1 {
  color: #424242 !important;
}

.text-body-1 {
  font-size: 0.875rem !important;
  line-height: 1.25rem !important;
}

.text-body-2 {
  font-size: 0.75rem !important;
  line-height: 1rem !important;
}

.v-menu {
  z-index: 9999;
}

.v-date-picker {
  border-radius: 8px;
  overflow: hidden;
}

.v-dialog {
  border-radius: 12px;
}

.cardCss:hover {
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%) !important;
}
</style>
