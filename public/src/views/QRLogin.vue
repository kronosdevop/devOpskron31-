<template>
  <div>
    <v-app>
      <v-main>
        <v-container fluid>
          <v-layout class="justify-center">
            <v-flex>
              <v-row no-gutters>
                <v-col cols="2"> </v-col>
                <v-col
                  cols="4"
                  xs="4"
                  sm="4"
                  md="4"
                  class="py-0"
                  align="center"
                >
                  <v-card color="#CCC" outlined class="mt-6">
                    <v-toolbar color="#CCC" dense flat>
                      <v-toolbar-title>
                        <h6>To Login To Your Stichh Web Account</h6>
                      </v-toolbar-title>
                    </v-toolbar>
                    <v-card-text>
                      <v-list-item>
                        <v-list-item-content>
                          <div class="text-left">1. Open Stichh App.</div>
                          <div class="text-left mt-4">
                            2. Tap Scan
                            <v-icon small color="black">mdi-qrcode</v-icon
                            >option available at the bottom.
                          </div>
                          <div class="text-left mt-4">
                            3. Point Stichh Scan at QR Code to login.
                          </div>
                        </v-list-item-content>
                      </v-list-item>
                      <v-card-text class="mt-8">
                        <h5 class="text-left black--text">
                          To create an account download Stichh App.
                        </h5>
                      </v-card-text>
                      <v-card-actions align="center">
                        <v-btn
                          color="#FFF"
                          rounded
                          depressed
                          class="text-right"
                        >
                          <v-icon>mdi-google-play</v-icon>
                          Google Play
                        </v-btn>
                        <v-btn
                          color="#FFF"
                          rounded
                          class="ml-6 text-right"
                          depressed
                        >
                          <v-icon>mdi-apple</v-icon>
                          App Store
                        </v-btn>
                      </v-card-actions>
                    </v-card-text>
                  </v-card>
                </v-col>
                <v-col cols="4">
                  <v-card flat class="ml-4 mt-2">
                    <v-img
                      width="350"
                      src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAflBMVEX///8gICAAAAAdHR0aGhoFBQXy8vIsLCwVFRXr6+ukpKRnZ2f6+vpGRkYkJCTf39+2tra+vr6Xl5fIyMjW1tYPDw9SUlKrq6s5OTldXV1zc3M+Pj6GhoadnZ3t7e3m5uZvb28xMTHa2tpXV1djY2NMTEx7e3vDw8OCgoKLi4vmSQiFAAAMU0lEQVR4nO2da2OqvBKFK6CiotYqFbXe6qW7//8PnvOSWUOZMHJRu+1u1jcgCXmglWQyM3l6cnJycnJycsrUaSzZUqRdKC1gNXm7Tv2/raTbUPuNaGoapudHC41wHlDVrbiwG5nzr3S82TftVGIjdrqB30hByyL00gvhq3UTEJoCQSgJB7GpOQRhq2mnukWEfquR/JFNmF4ILhCamoFFGJqaTDhq2ilH6Agd4WMTelUVX08oa6qEceVelRN624qf1GgdC8JFskqV+HnCHp1n7anfvrwwahUTxuuovEOptl45oToSkeq3BeEwDFJR/5lwS+dZ/KfniwsthbDdr9qpzn0J0UNJGNT8b3KEjtAROkKVcNUOUwWCsMe/rqEQyMXp9upbCHuTj0JNMBCxCN+WRouA3sTU1Jjz52MpRPcMB+L8m0a41TrVa0A40UYNc40QmtHAIsiPM1res7wp/V17PXlBI5xrnZo0Iiz+J+F+qoRTreZcFIxAKMenKuGz1rQjdISO8LcS+mHu+2gTPv00wvdZqvc5XegeF6kOmFuDcDMjreieE6oqu/VohAl9m8z5VnBAP2lMk31J8RXDmAbHHw9OWDYuZcK51vTUETpCR+gIfz1hImY0PFOX8y7up5wDPTrhbJrXZLD7T4MlTryYE7sTvWz/WdT4QzXOD0ootfXSQVsMm8TTi5cbxvmBnPkORI3HJ0wLBMMIhHGupeorM47QETrCf5dQUXPCT2ohBGHVFdIvhDe0Jm6fFakW4Zc/Rmy+lYQz08DkDMTz25+veqMZsU5Y2qk7W/W9+D95R40Q4lFbGOcF4/ijrlvQuDQcVCZU5AgdoSP85wlld+5C2DaCNTGm4+BqwqicMF73q2m+C+sSTqkqbrEm16H4hZocBsWE4W5esVdwY7rk9YXnWSp8tqsTvph357085WuwVV/1+gqrdgquaPfx3CsnjOmV4U+qMmHtTjlCR+gIH5SwqeP/F+/L9EQMwjEFHVwiTEtkhDIaYXTLaIR9w8fV6jIh/H/y79C/QEijjPco1dMgoBog7Dbsk78vGJptek0lW0DjER3zTF4SokaHvIu7k42o0bhPmt3hzrIIodc4dRG2rPo/Tjoh/eI4woeXI3SEjy8QruWFoeJPc1N1XofVlMC8PE8q1jiKL76/l03OTMDLBgU7VOIQ5e+1wtuf0b2TdzrxtjIn1LjV/0ZtMrJFUWbV96pVCK11CxkqY/m1bUzTIce60r08uEdP6d7ejE4s21TjEmHFUZtctyiVujKTNWkTmieRRPl7xRkh1QTh2TQdrJ5UOcK/QRj884T//ju8MeEoNq4guK0fFuvLb2mYr4ESQb6FeJVZE0VbGmGnnJA6U4dwNzCiOE4/wQmhBQYez8d8jRDHB5rHdqmFM3/VjqKtriCEz9GkjPB9QZ0ZVydkrUz/4nN5UVIi1gMoZoZ9hHVJO80Ci9atEkJLdyWMQIh5dWmkM9dULFH8j+IIMznCr3KEdj8doV5zGOfnFoN2LjD/xoRjUoJFya055q8xHY8xo9nQ8ayMMBoreh+8pjpN6VZnc3ygOb+fzOgCjYbC81Y0gUdAhH6CCzZgB6knODaXjvlN4GMFX+a1iHxRCbeaqxbXwBwfg4kIH0QUjEWnWGJMwzXi6iszIc+aaVVbHZfqhEosd+a5J+00mxJXhuyekhBN11h7coSO0BF+J2GYyxFTgdDLfbx0Qs6pIG1sIRbmVEKUxCOyrHTC1sZf0iJC2EtHecLgsNmm2hwFIdtLRwrhqZNW7M0AaBlYZ720ROekEI5QkJZv/a5oYC/tpUMULFghjWgddiXeoi+eIxNShaijfPG5Jl5Ae851qKbISiQJ/aRDncrGNPkWItH7CDWLCCFJ2MLaOP4YZe4HbdTGNdFQUSx3vmmLsPKoDbrguacTCtUglDW1aHUu4AgdoSP8LYR7MWFhYXplEXbFXIi/FqIlO2vESsy/QNih8122tBLhZxnhBR9h1vPc6I9AjD/pwotU35zvsysw3WVFFdYya8RM1JxTrEx4xgU636fDNRzeXtfmBD9l2ZvPsJwQ+hB/azxAevPybrmhbEyO2qysEfDz5rdOoza4AnuwRXTgGwz7TUAF4Fj2dBCdueAjbEnGrvGf0JsY5JbmvtRiua2RN1TqmxjucK9FWFjAETpCR/hDCK/5LTU/eCf0Ez+dKuGJSsj4wx6CP0p/S3lV1tTwWjZhNBdq/j0cK1+1lzWdWIaCkNpcD0UMaUf7HqJpdGZ9wqosTtjBTR22vl49poFgCf6SU8GI44DLIp1ZckwzRS8xx7+LpwITynFpRkj9bRzLzfo7vhiO0BE6wvsRCgtZBUKKfJGfIJuwnWv6bxFKK6dKmNlLjdXT6wlb5tiOsMw17QdjYfzMCIU5VNhLLxGKmjah927s0Ju54rZm27xRYyEM0pwDgl1/yXq+xixuJWogCAi27oOwYrDNO8GkWq5boObrTXKbkCMv7zMzFF7GPAZTY7nFKkQ2Og2kj3Abrz3/B2avzFDNb8lmxr2tHa3ONaUlyu5Mg9W1RyK0bG2O0BH+PkJFlj8NasisgtDeJhTiZWShkfwtZX8aSbjLX6hE2NE8mSyfqAV5Ns20GrhH/2RKvgjPpi3WgOfS5YlrGkL4RG2f5Re/h87cMrcJFCXknVZak8Y0Xv3IrtJRG3TT7C2QOvK21Dx2zRGyHKEjLNS/T/hUm9CKIT3Rx0wllNbEmbQmQlhbtczUBYQzE5ZyVJddZcyMRdhbiJgZxJAORejM8Zmz7Cqi4ZK/ouM/yMt7ptgZvMsIFwoswvaYxuzbo0a+yLgni3DsybgnzHxlKFXm560EW4lQqsyqvzA1ODPkBWnj0lCNrFV9E6EyS1RWU/HVV2WtzDhCR+gIfwphmJ8hTMxEINYJRTy+9SUdkzHOspdK2YTF5djI1oyQfITZgPdBaQyWWg2ZUyEZi12/t5QZgXMq9KV9FDUpp0JEbsit0am4IJyFwwHtSxpRvGoVwhsIc/wLmRsUIWaGAIOTWhJTYWEd+CZCmc2sujRPBVvrYoONI7yRHKEuR5jpxxLGubWnOxFen3NPEkaVax6T4n25OeceDyY0wrnofsFs/BZ5E4tzX+ryMZax14DpqdOSaZYpWSFsjfLBTEV5E2+R+1IQUu5LXWH57g/kIlBK2Mq3XJj78m75S/Wa9fe30AlF047QETrCxyZsnpN9Rb7B2KNk7OViIKzM6rZHqiTsxdQk25AloexthZzsV+TVR+573tWGmnqhZxcuZXZ8KrBGdyRhhHJsvBeE8Wf9vPpX7I2gyYqZYeGtY61X9WtjCULLql9hb4Qr9rfQZPnqc3fK8nnbkoR3XZlxhCxH6Ai/6jEJ9d/S6wntFdJ086/2qAJh/X3XJlSAY13puI/v4XkimkowZKEN2RD5ksiC0GSZt/vHa9Gp6Gy2cPustEKqqHQvWViEx3TMj93KgcT5JIT3l4zfySQXNhDIc8XKjKVSz73qc/zbyRE6wnxjjvAXEY5lUl3LhxgXak++fVGzSr76OxD2jru8pJu0jwJ17Qt+giZ55zaxw3c1j6FrCS2tZWQXah5Kso1IZavcWDWO5Xfznp7sOqEau/bamLBGLLcjdISO0BH+KMKd1TgJO4/zViUyB62VDM/L1+D5F4zOTIj5V52YmcaE/v64yGmJr+92luqdPWkPpsDh4z29MF7kEf39lGp8Uh7hpSk442AaImz3zYX3KYJN7xrZJVyAMx9hKIshlT7CtbNdw68No7Y6FuFvjF27ASGvJDhCR+gIfxihIth1VcIgb0W0CfvCmujBdWiHVVe63uVnomUVPAhrYh3C3uSjUBPVIox9w1+npiR1yybcUtMT5PAfLFOd6dhPqIXnJQmm4uEyr92cWsIzuq9Vv/Lu8Sy8dWGTyPJEBXFhzEwWbWNb9R+KUGb3hKrvePzNKzOO0BE6wp9MKNLlZzuPt3KhMgWETX5Lt51qiuCcYxEeKaAFu5MNN0oTG8woyUUYShbUwnhIZzT3Xm8qmtyWE1q5KVRhGquOaTA209c7cUt77zwa05Rl/rB72yonrKvScWm5tN0By3MMqZ16dEItn3f1TjnCWo05wnJ9F2HTaIQv+dqateB7cg+xjYljCL7s6VyzU0WESbeh9pxZvWkLsfUO2+YCjxX6fs0mk4KBS8UPfYFu10KGKC5E1zfp5OTk5OT0m/U/+VMxwv56rZUAAAAASUVORK5CYII="
                    ></v-img>

                    <v-card-title class="">
                      <div class="mt-n4">
                        <h6>Scan QR code with Stichh App to login.</h6>
                      </div>
                    </v-card-title>
                    <!-- <v-card-actions class="ml-1 justify-start black--text">
                     
                    </v-card-actions> -->
                  </v-card>
                </v-col>
              </v-row>
            </v-flex>
          </v-layout>
        </v-container>
      </v-main>
    </v-app>
  </div>
</template>