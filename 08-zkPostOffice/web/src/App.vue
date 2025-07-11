<template>
  <div style="width: 1600px;">
    <el-container>
      <el-header>
        <el-alert title="支持零知识证明的加密信件服务 (Sepolia, Blast Sepolia, 本地Hardhat网络)" type="success" center show-icon />
        <el-row>
          <el-col :offset="9" :span="6" style="font-size: 30px;">
            ZK Post Office
          </el-col>
          <el-col :offset="5" :span="4">
            <div style=" padding-top: 8px;">
              <el-button type="primary" @click="connectWallet()" v-show="network == null">Connect Wallet</el-button>
              <div v-show="network != null" style="font-size: 20px;">{{ network }}&nbsp;&nbsp;&nbsp;{{ address }}
              </div>
            </div>
          </el-col>
        </el-row>
      </el-header>
    </el-container>
    <br>
    <el-divider>
      <el-icon><star-filled /></el-icon>
    </el-divider>
    <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick" type="border-card" stretch=true>
      <el-tab-pane label="ZK PostOffice" name="first">
        <PostOffice />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style>
.el-radio {
  margin-right: 5px;
}

.el-progress__text {
  display: none;
}

.el-main {
  padding: 0;
}
</style>

<script>
import { ethers } from "ethers";
import { ElMessage } from 'element-plus'
import { ref } from 'vue'
import PostOffice from './components/PostOffice.vue'

export default {
  name: 'App',
  created() {
    ethereum.on('accountsChanged', this.accountsChanged);
    ethereum.on('chainChanged', this.chainChanged);
    ethereum.on('disconnect', this.disconnect);
  },
  data() {
    return {
      activeName: ref('first'),
      network: null,
      chainId: null,
      address: null
    }
  },
  methods: {
    async connectWallet() {
      if (window.ethereum == null) {
        ElMessage.error('Please install metamask')
      } else {
        try {
          let provider = new ethers.BrowserProvider(window.ethereum)
          let signer = await provider.getSigner();
          this.address = signer.address.substring(0, 8) + "..."
          const network = await provider.getNetwork()
          this.chainId = network.chainId;
          this.network = network.name
          if (this.chainId == 168587773n) this.network = "blast sepolia"

        } catch (error) {
          if (error.info.error.code === 4001) {
            ElMessage({ message: "User rejected the request", type: 'warning' });
          }
        }
      }
    },
    async accountsChanged(accounts) {
      console.log(accounts);
      if (accounts.length > 0) {
        let provider = new ethers.BrowserProvider(window.ethereum)
        let signer = await provider.getSigner();
        this.address = signer.address.substring(0, 8) + "..."
      } else {
        this.network = null;
        this.address = null
      }
    },
    async chainChanged(networkId) {
      console.log(networkId);
      let provider = new ethers.BrowserProvider(window.ethereum)
      this.network = (await provider.getNetwork()).name

    },
    disconnect() {
      this.network = null;
      this.address = null
    },
  }
}

const connectWallet = async () => {
  //child.value.testLog();
  if (window.ethereum == null) {
    ElMessage.error('Please install metamask')
  } else {
    try {
      provider = new ethers.BrowserProvider(window.ethereum)
      signer = await provider.getSigner();
      network = (await provider.getNetwork()).name
    } catch (error) {
      if (error.info.error.code === 4001) {
        ElMessage({
          message: "User rejected the request",
          type: 'warning',
        })
      }
    }
  }
}

</script>