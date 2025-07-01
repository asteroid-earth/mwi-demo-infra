import * as teleport from "@pulumi/teleport";
import { teleportProvider } from "../providers";

export const webWorkloadID = new teleport.WorkloadIdentity("w2w-demo-web", {
  version: "v1",
  metadata: {
    name: "w2w-demo-web",
    description: "Workload ID for w2w-demo web component",
    labels: {
      "env": "w2w-demo",
      "component": "web",
    }
  },
  spec: {
    spiffe: {
      id: "/apps/w2w-demo/web",
    },
    rules: {
      allows: [
        {
          conditions: [
            {
              attribute: "workload.unix.uid",
              eq: {
                value: "3001"
              }
            },
            {
              attribute: "workload.unix.gid",
              eq: {
                value: "3001"
              }
            }
          ]
        }
      ]
    }
  },
}, { provider: teleportProvider })

export const backend1WorkloadID = new teleport.WorkloadIdentity("w2w-demo-backend-1", {
  version: "v1",
  metadata: {
    name: "w2w-demo-backend-1",
    description: "Workload ID for w2w-demo backend 1",
    labels: {
      "env": "w2w-demo",
      "component": "backend-1",
    }
  },
  spec: {
    spiffe: {
      id: "/apps/w2w-demo/backend-1",
    },
    rules: {
      allows: [
        {
          conditions: [
            {
              attribute: "workload.kubernetes.namespace",
              eq: {
                value: "w2w-demo"
              }
            },
            {
              attribute: "workload.kubernetes.service_account",
              eq: {
                value: "backend-1"
              }
            }
          ]
        }
      ]
    }
  },
}, { provider: teleportProvider })

export const backend2WorkloadID = new teleport.WorkloadIdentity("w2w-demo-backend-2", {
  version: "v1",
  metadata: {
    name: "w2w-demo-backend-2",
    description: "Workload ID for w2w-demo backend 2",
    labels: {
      "env": "w2w-demo",
      "component": "backend-2",
    }
  },
  spec: {
    spiffe: {
      id: "/apps/w2w-demo/backend-2",
    },
    rules: {
      allows: [
        {
          conditions: [
            {
              attribute: "workload.kubernetes.namespace",
              eq: {
                value: "w2w-demo"
              }
            },
            {
              attribute: "workload.kubernetes.service_account",
              eq: {
                value: "backend-2"
              }
            }
          ]
        }
      ]
    }
  },
}, { provider: teleportProvider })

export const appBotWebRole = new teleport.Role("w2w-demo-app-bot-web", {
  version: "v7",
  metadata: {
    name: "w2w-demo-app-bot-web",
  },
  spec: {
    allow: {
      workloadIdentityLabels: {
        "env": ["w2w-demo"],
        "component": ["web"],
      },
      rules: [
        {
          resources: ["workload_identity"],
          verbs: ["list", "read"],
        }
      ]
    }
  }
}, { provider: teleportProvider })

export const appBotBackend1Role = new teleport.Role("w2w-demo-app-bot-backend-1", {
  version: "v7",
  metadata: {
    name: "w2w-demo-app-bot-backend-1",
  },
  spec: {
    allow: {
      workloadIdentityLabels: {
        "env": ["w2w-demo"],
        "component": ["backend-1"],
      },
      rules: [
        {
          resources: ["workload_identity"],
          verbs: ["list", "read"],
        }
      ],
    }
  }
}, { provider: teleportProvider })

export const appBotBackend2Role = new teleport.Role("w2w-demo-app-bot-backend-2", {
  version: "v7",
  metadata: {
    name: "w2w-demo-app-bot-backend-2",
  },
  spec: {
    allow: {
      workloadIdentityLabels: {
        "env": ["w2w-demo"],
        "component": ["backend-2"],
      },
      rules: [
        {
          resources: ["workload_identity"],
          verbs: ["list", "read"],
        }
      ],
    }
  }
}, { provider: teleportProvider })

export const appBot = new teleport.Bot("w2w-demo-app", {
  name: "w2w-demo-app-bot",
  roles: ["w2w-demo-app-bot-web", "w2w-demo-app-bot-backend-1", "w2w-demo-app-bot-backend-2"],
}, { provider: teleportProvider })

export const appBotIAMJoinToken = new teleport.ProvisionToken("w2w-demo-web-bot", {
  version: "v2",
  metadata: {
    name: "w2w-demo-web-bot",
  },
  spec: {
    botName: appBot.name,
    joinMethod: "iam",
    roles: ["Bot"],
    allows: [
      {
        awsAccount: "668558765449",
        awsArn: `arn:aws:sts::668558765449:assumed-role/MWIw2wDemoInstance/i-*`
      }
    ]
  },
}, { provider: teleportProvider })

export const appBotK8sJoinToken = new teleport.ProvisionToken("w2w-demo-web-backend", {
  version: "v2",
  metadata: {
    name: "w2w-demo-backend-bot",
  },
  spec: {
    botName: appBot.name,
    joinMethod: "kubernetes",
    roles: ["Bot"],
    kubernetes: {
      type: "static_jwks",
      staticJwks: {
        jwks: '{"keys":[{"kty":"RSA","kid":"0aa3cdecc26c66922ce30ab15a7fa98a345a02a3","use":"sig","alg":"RS256","n":"lkDJ42a7YgiDHZPFuuNWBhPshhSBNt5b3fMhfaZUxTamlxboT8BgjWUlQWSeuFMnyNMc44JrK_dBc_FUsSa1olCcCH2NV23CRUyX00zF8p6jjq8njS9xPl7otitxd01ylLlHsLlLpbW12l5H1mdevwXBVwlJofm6o8zkHX3iaqgK7c2HVrrjR8nwyjKIrPOtMQAkBsh8iSmI1xVCwG8F1yfjZZrRJjnVrfnnoWzm1i4yBNMGvBVYmRsct9Kic_eGCJ1XYbFDpKJsSJgd0lOtMffepbJVJZUJ2xOMpIaRbMED4-qtmrKf5doOvEFTxV6wf21uJ5HHe0w1ORADCdLihw","e":"AQAB"},{"kty":"RSA","kid":"282e8e193b93d13ccb5a98d92a8caa04aa753b6a","use":"sig","alg":"RS256","n":"yCiUAo0h7YZSxwtuoErPuMStk6YBUMWe7DQjdgkvYFzFkR6nY_QZixrXLE6-UsNRdJPIHgOXws2wRkyx8yHqI4XEWT1pTcj57tCjQn_TYo9TC8PEU0EQ66EUW8s6rtwn5zWDg0pGaMylnZM0jN78FEQMrC4j3pstGZD6HOTDY1LNf1fvVXvH4is395nsIiZnbMS56zGk16b-2OgraDqCYv2riwF-DO_wimKYCHUV86gy1aO-Unph0CQc88u0Mo71Uf71YIlQF7CozhApgvno9yDLu1guncO5DJ8Rd5IDPTDK_Ceu_wjaiuBYvmJ5I_fJ5cK8Rha_pFO-FqPMPLclpw","e":"AQAB"},{"kty":"RSA","kid":"3a49edfeb833056f2ea03170542b395cceff0935","use":"sig","alg":"RS256","n":"zh01zmFTs6wFXacJsDm8UrB-9aOeAWpXdxIH-nwsPCiOdCjBNY1hjvCf7PSHSmjyu2fhA1J8feZscSYPOiartaYukwfFXUgAwGYymje4YuMOt2S1KHfoHKyPa00ImjcibpF6zezHlfFe3AII21Q-1ia5O9Yh2yU7XsZF182RdJ-lEDE9A1YfITtAfOEcIOPJucxiyA8yw6vO-v1ezJNI9mqTa1EeO5H-S8Kxi0PVoDvNaMMI1Y1fMpW_FWeZravOJpjzGLR7K4jNQgmxOc2HdZ4l4eOqWoJL7RPI9CS7QucRncAkSdYBI-v0u_IveOw1JgWoypYS5oM2jYT7v254Pw","e":"AQAB"},{"kty":"RSA","kid":"5b2a429bf1941d4126402ee486746e7a1245d32c","use":"sig","alg":"RS256","n":"xqX0Hg_5N-0nz4pwNt2JZKROorCDwAUieqnRx69n1CaYqrA-YWUzeEdGu7EEmjcj2Yajp4r04LaDmBj8oA5J4NJYToS-jGLSAP2RvHu1jtmH-i_WeFAdCBdCZQsjvbbCL6OGHwNxMfDlmxn3BT9Rmh9shFonqZFVks5w9hmVGw_R4KmNcPJTxbxhC9meMKPQK5u6QSt2SOzKv2tDU00a5HZCq3R_uscRN0bCYip5XHQWGYcX7JJASZVSKbAycEg4UG8vHRA2fxGN9gMi34PwOY0CBpnkeX0An5P5JlTOq62tlaT7kd7JP4hA2ivxvIxG7s6eNCRFcamqHn0ncLlWKw","e":"AQAB"},{"kty":"RSA","kid":"5bb3a52f6edd8f9e93a131144075a09b56949ed5","use":"sig","alg":"RS256","n":"uwUWB_QiJeuUjpfOMvjcf41W2fqUYgNd2xXT_w8tehwI_GENHO4VVajkHpYcaAP0jcCBd8RFe6yGFaQS4bYnnNfNes6C5Z9Z1voLLY-yOc0UmkYUu5_YfculSKJSDGWTgh15TsVeSw2baqL5nRHeEWaCGHQ_nvMLULv1_xqzy2y3SgF9HxoGkabyvYnboH4ib_RCD1JrcFWiSP5rf0Ln4t0TlC-pV3TstsjV2WjVd11CccUNwTXK-Z2Sey3VAhHu6RRU95sTzexlmlabAbjAMr59Yk4rXYPtkELzCkcDCIi4k2Zwj_Go_vDUBX-zZ7dlfvQ7xlZ5IHcl__O5bCPMWw","e":"AQAB"},{"kty":"RSA","kid":"82cc6250f6fa394a75839b5afd1b0bd02ba0b16e","use":"sig","alg":"RS256","n":"xcGsWfjE-z7dhLQH_on1iXqHXl7rr9p4JvkGXB-moJyD83Q1z8oYY-eDAl0WAAWH8sSCX4EkTFKUxUpgnWUC011AI8LhGC21ViCGrQt70xMKsuIarCEuXQF6THfRuEOHs_cSOUtbnHIgpgNzAaW6JQ4vOtOkDt1BeLekyK_h7A9db7htbq4hT_7CeUBw4CtWNW1gc2jH1d4_jT9QmSPQPrYwiP13LgWt25d94WEfbK7j1pPox_W3bm_D67yR4DHZsIYYC4Fbya843JyhT7HvBawX3NeMbJBVed_tUAjM_NSvy1VqeVxCSiiuPllnuy3LR4f5eMovKdj_pVKT_MiOQQ","e":"AQAB"},{"kty":"RSA","kid":"bc420b345d6c3d543aff4f132a651f45b0586414","use":"sig","alg":"RS256","n":"rS6LpWSNxrN80sbi92Y3gz7p16BiSWyAdFt-dsUW8GvBbEAzNVLmATvretU9oLr8AOM-Un-7zpsrugvkTTn6synqnqSdRZZLnZNDkJKy4j2swNjDzM9GNirNsQy3pKnmLZo174pI-CKISqMs5WfJ_7JYsfxtrWlAc4NrbBhGWpvwxnprap34CaxPFebtdpr-yET2PhKWmGO4R6y3nXFk4KNOQIz7ffz4uRqk9K6Dq54t5Z8kCEa2yC6tewzgHygmex0ZYpf7F-k-suHoPZsfhBgyydRS0FBfjOa_MmDY8oLW8vad9a69-lmRaJHby0spipCbLdh430dq-Id_8g41Ew","e":"AQAB"},{"kty":"RSA","kid":"fc102e6480cb8e42fd97a761537522beba4016c3","use":"sig","alg":"RS256","n":"2AfHFxrOF0eCA0t2ga5ZtW0Z659OUCzUTwVElSnVS5UcrTWrKYPncMLlql3zYt74eT3YCwAR0tKfGOM0IkdBRV937iqw6mTtdURmevxQLV75PFNcQShH_SLYhTuVe23Fe2Dsaowzq3K-5buYwGDYDbxh6vorCb3ZwFrO6A38zD_2tDJJ1zdPJRw6Xaq9ntf9AfJDzzJjupzuA5U-iR26WIeTyru6r0lm4xTF6bmHfJgfi1GF2H2m2oxx7sg7V2vJcVvZNYLIWveXewiQcTqDJEiANeFcM5M9j7NvdF5bsLKHBgxk6enX1CAQiND9BbKv8GoZDBkAMoAaPGm4M3C_hw","e":"AQAB"},{"kty":"RSA","kid":"fc8c957655c16f41cc6cf1ac853995c7c842777b","use":"sig","alg":"RS256","n":"rVaKzNPShmuxuNPjS8Do3V4nMZf2jHojgvugNVBxgsFztwhNfKY_UmQO4jlKTWEsYjcBEIekIkwJHvcYH99eoRUXckYjwbdFDskcKW9V7vBn0UBWUfCoLnsJQHN1wXQ1Bd1nqvqwdOnD1Ru0me7U_eaxc7FFq0sfBxUJ-xhW0GwglW0w3DlmE4Tnu_X710oFtdMNO45ayIzelZS0-JN0F4Wr19gBSi7Ez3IuPP295Fm6hLJcfoTlwGaBHxQSDmxJvydod-a8B1iRhXgTE9pZ0WQ_6hBS9HBiag5ymzGAAVAdG0goaja0YH2ycvTB4clec4uYktmAsYiXjJ72e4giNQ","e":"AQAB"}]}'
      },
      allows: [
        {
          serviceAccount: "tbot:tbot"
        }
      ]
    }
  },
}, { provider: teleportProvider })
