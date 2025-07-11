<template>
  <div class="post-office-container">
    <div class="header">
      <h1 class="title">🏢 ZK Post Office</h1>
      <p class="subtitle">零知识证明邮局系统 - 安全隐私的信件传递</p>
    </div>
    <el-tabs v-model="activeName" class="main-tabs" stretch=true>
      <el-tab-pane label="📮 发送信件" name="first">
        <div class="tab-content">
          <el-card class="section-card">
            <template #header>
              <div class="card-header">
                <h3>📋 基本信息</h3>
              </div>
            </template>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="收件人密码" label-width="120px">
                  <el-input 
                    v-model="receiverPassword" 
                    type="password"
                    placeholder="请输入收件人密码" 
                    class="custom-input"
                    prefix-icon="Lock"
                    show-password
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="截止时间" label-width="120px">
                  <el-input 
                    v-model="deadline" 
                    placeholder="时间戳 (默认为当前时间+10天)" 
                    class="custom-input"
                    prefix-icon="Clock"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item label="信件内容" label-width="120px">
                  <el-input 
                    v-model="letterMessage" 
                    type="textarea"
                    :rows="3"
                    placeholder="请输入您要发送的信件内容（可选）" 
                    class="custom-input"
                    show-word-limit
                    maxlength="500"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item label="密语提示" label-width="120px">
                  <el-input 
                    v-model="secretWords" 
                    type="textarea"
                    :rows="2"
                    placeholder="请输入密语提示信息，帮助收件人验证身份（可选）" 
                    class="custom-input"
                    show-word-limit
                    maxlength="200"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-card>

          <el-card class="section-card">
            <template #header>
              <div class="card-header">
                <h3>💡 使用说明</h3>
                <p class="card-subtitle">关于密码的重要信息</p>
              </div>
            </template>
            <el-alert 
              title="收件人需要使用您设置的密码来领取信件，请妥善保管并通过安全渠道告知收件人" 
              type="info" 
              :closable="false"
              class="alert-tip"
            />
          </el-card>

          <el-card class="section-card">
            <template #header>
              <div class="card-header">
                <h3>📦 发送附件</h3>
                <p class="card-subtitle">您要发送的资产</p>
                <el-alert 
                  title="提示：选择ERC20类型会自动填入测试代币地址，需要先授权才能发送" 
                  type="info" 
                  :closable="false"
                  class="alert-tip"
                />
                <el-alert 
                  title="测试代币地址：0xdD65BbD2b171d728513630cEFfDDC5D6451fEeD8" 
                  type="success" 
                  :closable="false"
                  class="alert-tip"
                />
              </div>
            </template>
            <div v-for="(item, index) in annexs" :key="index" 
                 class="annex-item" 
                 :class="{
                   'erc20-ready': item.type === 1 && item.allowanceStatus === 'sufficient',
                   'erc20-need-approval': item.type === 1 && item.allowanceStatus === 'insufficient'
                 }">
              <div class="annex-header" v-if="item.type === 1 && item.allowanceStatus">
                <span class="annex-status">
                  {{ getAnnexStatusIcon(item) }} {{ getAnnexStatusText(item) }}
                </span>
              </div>
              <el-row :gutter="20" align="middle">
                <el-col :span="6">
                  <el-form-item label="类型">
                    <el-radio-group v-model="item.type" class="radio-group" @change="onAnnexTypeChange(item, index)">
                      <el-radio :label="0" class="radio-button">ETH</el-radio>
                      <el-radio :label="1" class="radio-button">ERC20</el-radio>
                      <el-radio :label="2" class="radio-button">ERC721</el-radio>
                      <el-radio :label="3" class="radio-button">ERC1155</el-radio>
                    </el-radio-group>
                  </el-form-item>
                </el-col>
                <el-col :span="6" v-if="item.type == 1 || item.type == 2 || item.type == 3">
                  <el-form-item label="合约地址">
                    <div class="address-input-container">
                      <el-input 
                        v-model="item.address" 
                        placeholder="代币合约地址" 
                        class="custom-input"
                        @blur="onAddressChange(item, index)"
                      />
                      <div v-if="item.type == 1 && item.address" class="token-info">
                        <el-tag v-if="item.tokenName" size="small" type="success">{{ item.tokenName }}</el-tag>
                        <el-tag v-if="item.allowanceStatus !== null" 
                                :type="item.allowanceStatus === 'sufficient' ? 'success' : 'warning'" 
                                size="small">
                          {{ item.allowanceStatus === 'sufficient' ? '已授权' : '需要授权' }}
                        </el-tag>
                      </div>
                    </div>
                  </el-form-item>
                </el-col>
                <el-col :span="4" v-if="item.type == 2 || item.type == 3">
                  <el-form-item label="Token ID">
                    <el-input 
                      v-model="item.id" 
                      placeholder="ID" 
                      class="custom-input"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="5" v-if="item.type == 0 || item.type == 1 || item.type == 3">
                  <el-form-item label="数量">
                    <el-input 
                      v-model="item.amount" 
                      :placeholder="item.type == 3 ? '整数' : '如: 1.123'"
                      class="custom-input"
                      @blur="onAmountChange(item, index)"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="3" v-if="item.type == 1 && item.allowanceStatus === 'insufficient'">
                  <el-button 
                    type="warning" 
                    size="small"
                    @click="approveToken(item, index)"
                    :loading="item.approving"
                    class="approve-btn"
                  >
                    {{ item.approving ? '授权中...' : '授权' }}
                  </el-button>
                </el-col>
                <el-col :span="3" v-if="index > 0">
                  <el-button 
                    type="danger" 
                    icon="Delete" 
                    circle 
                    @click="deleteAnnex(index)"
                    class="delete-btn"
                  />
                </el-col>
              </el-row>
            </div>
            <div class="add-annex-btn">
              <el-button type="primary" icon="Plus" @click="addAnnex()">添加附件</el-button>
            </div>
          </el-card>

          <div class="action-section">
            <el-button 
              type="success" 
              size="large" 
              @click="sendLetter()" 
              v-if="!sending"
              class="send-btn"
              icon="Promotion"
            >
              📤 发送信件
            </el-button>
            <!-- 测试发送简单信件按钮已移除 -->
            <div v-if="sending" class="loading-section">
              <el-progress :percentage="70" :indeterminate="true" class="progress-bar" />
              <p class="loading-text">正在发送信件，请稍候...</p>
            </div>
            <div v-if="letterId" class="result-section">
              <el-alert 
                title="信件发送成功！" 
                type="success" 
                :closable="false"
                class="success-alert"
              />
              <div class="letter-id">
                <strong>信件ID:</strong> 
                <el-tag type="success" size="large" class="id-tag">{{ letterId }}</el-tag>
                <el-button 
                  size="small" 
                  icon="CopyDocument" 
                  @click="copyToClipboard(letterId)"
                  class="copy-btn"
                >
                  复制
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="📬 领取信件" name="second">
        <div class="tab-content">
          <el-card class="section-card">
            <template #header>
              <div class="card-header">
                <h3>🔍 查询信件</h3>
                <p class="card-subtitle">输入信件ID进行查询</p>
              </div>
            </template>
            
            <div class="query-section">
              <el-input 
                v-model="queryId" 
                placeholder="请输入信件ID" 
                class="query-input"
                prefix-icon="Search"
                clearable
              />
              <el-button type="primary" @click="getLetter()" icon="Search" class="query-btn">查询</el-button>
            </div>
          </el-card>
          
          <div v-if="queryLetter.id" class="query-results">
            <el-card class="section-card info-card">
              <template #header>
                <div class="card-header">
                  <h3>📋 基本信息</h3>
                </div>
              </template>
              
              <div class="info-content">
                <div class="info-item">
                  <span class="info-label">信件ID:</span>
                  <span class="info-value">
                    <el-tag size="medium" effect="plain" class="id-tag">{{ queryLetter.id }}</el-tag>
                    <el-button size="small" icon="CopyDocument" @click="copyToClipboard(queryLetter.id)" class="copy-btn">复制</el-button>
                  </span>
                </div>
                
                <div class="info-item">
                  <span class="info-label">发送人:</span>
                  <span class="info-value">
                    <el-tag size="small" type="info" class="address-tag">{{ queryLetter.sender }}</el-tag>
                  </span>
                </div>
                
                <div class="info-item">
                  <span class="info-label">截止时间:</span>
                  <span class="info-value">{{ queryLetter.deadline }}</span>
                </div>
                
                <div class="info-item" v-if="queryLetter.message">
                  <span class="info-label">留言:</span>
                  <span class="info-value">{{ queryLetter.message }}</span>
                </div>
                
                <div class="info-item" v-if="queryLetter.secretWords">
                  <span class="info-label">密语提示:</span>
                  <span class="info-value">
                    <el-tag type="warning" effect="plain">🔒 需要ZK证明验证才能查看</el-tag>
                  </span>
                </div>
                
                <div class="info-item">
                  <span class="info-label">领取状态:</span>
                  <span class="info-value">
                    <el-tag type="success" v-if="queryLetter.claimed">已领取</el-tag>
                    <el-tag type="warning" v-else>未领取</el-tag>
                  </span>
                </div>
              </div>
            </el-card>
            
            <!-- ZK证明验证后的详细信息 -->
            <el-card v-if="letterDetails.verified" class="section-card detail-card">
              <template #header>
                <div class="card-header">
                  <h3>🔓 信件详细内容 (已验证)</h3>
                  <p class="card-subtitle">通过零知识证明验证后的完整信息</p>
                  <el-button 
                    size="small" 
                    type="info" 
                    icon="Close" 
                    @click="clearLetterDetails()"
                    class="clear-details-btn"
                  >
                    清除详情
                  </el-button>
                </div>
              </template>
              
              <div class="info-content">
                <div class="info-item" v-if="letterDetails.message">
                  <span class="info-label">信件内容:</span>
                  <div class="info-value">
                    <el-card class="message-card">
                      <pre class="message-text">{{ letterDetails.message }}</pre>
                    </el-card>
                  </div>
                </div>
                
                <div class="info-item" v-if="letterDetails.secretWords">
                  <span class="info-label">密语提示:</span>
                  <div class="info-value">
                    <el-card class="secret-card">
                      <pre class="secret-text">{{ letterDetails.secretWords }}</pre>
                    </el-card>
                  </div>
                </div>
              </div>
            </el-card>
            
            <el-card v-if="queryAnnexsShow.length > 0" class="section-card">
              <template #header>
                <div class="card-header">
                  <h3>📦 附件信息</h3>
                  <p class="card-subtitle">该信件包含 {{ queryAnnexsShow.length }} 个附件</p>
                </div>
              </template>
              
              <ul class="annex-list">
                <li v-for="(item, index) in queryAnnexsShow" :key="index" class="annex-list-item">
                  <div class="annex-detail">
                    <el-tag :type="getAnnexTypeColor(item.type)" class="annex-type-tag">{{ item.type }}</el-tag>
                  </div>
                  
                  <div class="annex-detail" v-if="item.type === 'ERC721' || item.type === 'ERC20' || item.type === 'ERC1155'">
                    <strong>合约:</strong> 
                    <el-tag size="small" type="info" class="address-tag">{{ item.token }}</el-tag>
                  </div>
                  
                  <div class="annex-detail" v-if="item.name">
                    <strong>名称:</strong> {{ item.name }}
                  </div>
                  
                  <div class="annex-detail" v-if="item.type === 'ERC721' || item.type === 'ERC1155'">
                    <strong>Token ID:</strong> {{ item.id }}
                  </div>
                  
                  <div class="annex-detail" v-if="item.type === 'ETH' || item.type === 'ERC20' || item.type === 'ERC1155'">
                    <strong>数量:</strong> {{ item.amount }}
                  </div>
                </li>
              </ul>
            </el-card>
            
            <div class="claim-btn-container">
              <el-button 
                type="primary" 
                size="large" 
                @click="viewLetterDetails()" 
                class="detail-btn" 
                icon="View"
                style="margin-right: 15px;"
              >
                🔍 查看信件详情 (需要密码)
              </el-button>
              
              <el-button 
                type="success" 
                size="large" 
                @click="claim()" 
                class="claim-btn" 
                icon="Check"
                :disabled="queryLetter.claimed"
              >
                {{ queryLetter.claimed ? '已领取' : '🔐 使用ZK证明领取信件' }}
              </el-button>
              
              <div v-if="queryLetter.claimed" class="claimed-notice">
                <el-alert
                  title="此信件已被领取"
                  type="info"
                  description="无法再次领取已处理的信件"
                  show-icon
                  :closable="false"
                />
              </div>
            </div>
          </div>
          
          <el-empty v-if="!queryLetter.id && queryId" description="未找到信件信息" />
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style>
.post-office-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.title {
  font-size: 2.5rem;
  color: #409eff;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #606266;
  font-size: 1.1rem;
  margin-top: 0;
}

.main-tabs {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.tab-content {
  padding: 20px;
}

.section-card {
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.card-header h3 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #303133;
}

.card-subtitle {
  color: #606266;
  margin-top: 0;
  font-size: 0.9rem;
}

.custom-input {
  width: 100%;
}

.address-input-container {
  width: 100%;
}

.token-info {
  margin-top: 8px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.token-info .el-tag {
  font-size: 0.8rem;
}

.approve-btn {
  width: 100%;
  margin-top: 8px;
}

.annex-item {
  position: relative;
  padding: 20px;
  margin-bottom: 15px;
  border: 1px solid #e6e6e6;
  border-radius: 8px;
  background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
}

.annex-item.erc20-ready {
  border-color: #67c23a;
  background: linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%);
}

.annex-item.erc20-need-approval {
  border-color: #e6a23c;
  background: linear-gradient(135deg, #fdf6ec 0%, #faf2e8 100%);
}

/* 附件状态头部 */
.annex-header {
  position: absolute;
  top: 8px;
  right: 12px;
  z-index: 10;
}

.annex-status {
  background: rgba(255, 255, 255, 0.9);
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  color: #606266;
  border: 1px solid #dcdfe6;
  backdrop-filter: blur(4px);
}

.erc20-ready .annex-status {
  background: rgba(103, 194, 58, 0.1);
  border-color: #67c23a;
  color: #67c23a;
}

.erc20-need-approval .annex-status {
  background: rgba(230, 162, 60, 0.1);
  border-color: #e6a23c;
  color: #e6a23c;
}

/* 增强的表单样式 */
.el-form-item {
  margin-bottom: 12px;
}

.el-form-item__label {
  font-weight: 500;
  color: #606266;
}

/* 查询信件样式 */
.query-section {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.query-input {
  width: 450px;
}

.info-card {
  margin-bottom: 20px;
}

.info-item {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
}

.info-label {
  font-weight: bold;
  margin-right: 10px;
  min-width: 120px;
}

.info-value {
  color: #606266;
  word-break: break-all;
}

.address-tag {
  font-family: monospace;
  background-color: #f0f9ff;
  border-radius: 4px;
  padding: 5px 8px;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
  display: inline-block;
}

.annex-list {
  list-style-type: none;
  padding: 0;
}

.annex-list-item {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 10px;
  display: flex;
  flex-wrap: wrap;
}

.annex-detail {
  margin-right: 20px;
  margin-bottom: 10px;
}

.annex-type-tag {
  margin-right: 10px;
}

.claim-btn-container {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

.claim-btn {
  min-width: 150px;
  height: 50px;
  font-size: 1.1rem;
}

/* 信件详情相关样式 */
.detail-card {
  border: 2px solid #67c23a;
  background: linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%);
}

.detail-btn {
  min-width: 200px;
  height: 50px;
  font-size: 1.1rem;
}

.claim-btn-container {
  flex-wrap: wrap;
  gap: 15px;
}

.message-card, .secret-card {
  margin-top: 8px;
  background-color: #fafafa;
  border-left: 4px solid #409eff;
}

.message-text, .secret-text {
  margin: 0;
  padding: 10px;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  white-space: pre-wrap;
  word-wrap: break-word;
  line-height: 1.6;
  color: #303133;
  background: transparent;
}

.secret-card {
  border-left-color: #e6a23c;
}

.secret-text {
  background: linear-gradient(45deg, #fff7e6, #fef7e0);
  border-radius: 4px;
}

.info-item .info-value {
  flex: 1;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .claim-btn-container {
    flex-direction: column;
    align-items: stretch;
  }
  
  .detail-btn, .claim-btn {
    width: 100%;
    margin-right: 0 !important;
    margin-bottom: 10px;
  }
  
  .token-info {
    flex-direction: column;
    gap: 4px;
  }
  
  .approve-btn {
    margin-top: 4px;
  }
}

/* 其他增强样式 */
@media (max-width: 768px) {
  .section-card {
    padding: 15px 10px;
  }
  
  .id-tag {
    max-width: 200px;
  }
}

.el-progress__text {
  display: none;
}

/* 领取信件相关样式 */
.query-section {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.query-input {
  flex: 1;
}

.query-btn {
  min-width: 100px;
}

.query-results {
  margin-top: 20px;
}

.info-content {
  padding: 10px 0;
}

.claimed-notice {
  margin-top: 15px;
}

/* 其他增强样式 */
.el-tag.address-tag {
  max-width: 160px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: monospace;
  word-break: break-all;
}

.annex-list-item {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.annex-detail {
  display: flex;
  align-items: center;
  gap: 5px;
}

.annex-type-tag {
  font-weight: bold;
  min-width: 70px;
  text-align: center;
}

@media (max-width: 768px) {
  .query-section {
    flex-direction: column;
  }
  
  .query-btn {
    width: 100%;
  }
  
  .info-item {
    flex-direction: column;
    gap: 5px;
  }
  
  .info-label {
    min-width: auto;
  }
}

/* 暗黑模式适配 */
@media (prefers-color-scheme: dark) {
  .info-value {
    color: #dcdfe6;
  }
  
  .card-subtitle {
    color: #a6a9ad;
  }
  
  .annex-list-item {
    background-color: #1e1e1e;
  }
}

.clear-details-btn {
  margin-top: 8px;
  font-size: 0.85rem;
}

.card-header {
  position: relative;
}

.card-header .clear-details-btn {
  position: absolute;
  top: 0;
  right: 0;
}

/* ERC20 代币相关样式 */
.address-input-container {
  width: 100%;
}

.token-info {
  margin-top: 8px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.token-info .el-tag {
  font-size: 0.8rem;
}

.approve-btn {
  width: 100%;
  margin-top: 8px;
}

.annex-item {
  position: relative;
  padding: 20px;
  margin-bottom: 15px;
  border: 1px solid #e6e6e6;
  border-radius: 8px;
  background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
}

.annex-item.erc20-ready {
  border-color: #67c23a;
  background: linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%);
}

.annex-item.erc20-need-approval {
  border-color: #e6a23c;
  background: linear-gradient(135deg, #fdf6ec 0%, #faf2e8 100%);
}

/* 附件状态头部 */
.annex-header {
  position: absolute;
  top: 8px;
  right: 12px;
  z-index: 10;
}

.annex-status {
  background: rgba(255, 255, 255, 0.9);
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  color: #606266;
  border: 1px solid #dcdfe6;
  backdrop-filter: blur(4px);
}

.erc20-ready .annex-status {
  background: rgba(103, 194, 58, 0.1);
  border-color: #67c23a;
  color: #67c23a;
}

.erc20-need-approval .annex-status {
  background: rgba(230, 162, 60, 0.1);
  border-color: #e6a23c;
  color: #e6a23c;
}

/* 增强的表单样式 */
.el-form-item {
  margin-bottom: 12px;
}

.el-form-item__label {
  font-weight: 500;
  color: #606266;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .token-info {
    flex-direction: column;
    gap: 4px;
  }
  
  .approve-btn {
    margin-top: 4px;
  }
}

/* 其他增强样式 */
</style>

<script>
import { ethers, Contract, AbiCoder } from "ethers";
import { ElMessage } from 'element-plus'
import { ref } from 'vue'
import BigNumber from "bignumber.js";
import { erc20Abi, zkVaultAbi, API_BASE_URL, ZK_CONTRACT_ADDRESS } from '../assets/config'
const coder = AbiCoder.defaultAbiCoder();

export default {
  name: 'PostOffice',
  data() {
    return {
      activeName: ref('first'),
      sending: false,
      contract: null,
      address: null,
      receiverPassword: null,
      letterMessage: "", // 信件内容
      secretWords: "", // 密语提示
      deadline: Math.floor(Date.now() / 1000) + (10 * 24 * 60 * 60), // 当前时间戳 + 10天
      // 测试代币地址
      TEST_TOKEN_ADDRESS: "0xdD65BbD2b171d728513630cEFfDDC5D6451fEeD8",
      annexs: [
        {
          type: "",
          address: "",
          amount: "",
          id: "0",
          tokenName: "", // ERC20代币名称
          allowanceStatus: null, // 授权状态: null, 'sufficient', 'insufficient'
          approving: false, // 是否正在授权
          decimals: 18 // 代币精度
        }
      ],
      letterId: "",
      queryPayment: {
        address: null,
        name: null,
        amount: null,
        showAmount: null
      },
      queryId: "",
      queryAnnexsShow: [],
      queryLetter: {
        deadline: null,
        recipient: null,
        sender: null,
        annexAmount: null,
        id: null,
        claimed: false,
        message: "",
        secretWords: "" // 添加密语字段
      },
      letterDetails: {
        verified: false,
        message: "",
        secretWords: "",
        annexes: []
      }
    }
  },
  methods: {
    async viewLetterDetails() {
      try {
        // 检查钱包连接
        if (!(await this.checkAndConnectWallet())) {
          return;
        }
        
        // 检查信件ID是否为空
        if (!this.queryId) {
          ElMessage({ message: "请先查询信件ID", type: 'warning' });
          return;
        }

        // 弹窗请求用户输入密码
        let password = this.$prompt 
          ? await this.$prompt('请输入信件密码以查看详细内容', '密码验证', { 
              inputType: 'password',
              confirmButtonText: '确认',
              cancelButtonText: '取消'
            }) 
          : prompt('请输入信件密码以查看详细内容');
          
        // 检查密码是否有效
        if (!password || !password.value) {
          ElMessage({ message: '密码不能为空', type: 'warning' });
          return;
        }
        password = password.value || password;
        
        // 显示加载状态
        const loading = this.$loading ? this.$loading({
          lock: true,
          text: '正在验证密码并获取信件详情...',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        }) : null;

        try {
          // 初始化提供者和合约
          const provider = new ethers.BrowserProvider(window.ethereum);
          const network = await provider.getNetwork();
          const chainId = network.chainId.toString();
          
          // 检查是否支持当前网络
          if (!ZK_CONTRACT_ADDRESS[chainId]) {
            if (loading) loading.close();
            ElMessage({ message: `不支持的网络ID: ${chainId}`, type: 'error' });
            return;
          }
          
          const zkVault = new Contract(ZK_CONTRACT_ADDRESS[chainId], zkVaultAbi, provider);
          
          // 从API获取零知识证明
          const resp = await fetch(`${API_BASE_URL}/api/generate-zk-proof?password=${encodeURIComponent(password)}`);
          if (!resp.ok) {
            throw new Error(`API错误: ${resp.status}`);
          }
          const data = await resp.json();
          if (data.error) {
            throw new Error(data.error);
          }
          
          // 构造ZK证明数据
          const zkProofData = {
            proof: data.proof.map(x => BigInt(x)),
            publicInputs: data.publicInputs.map(x => BigInt(x))
          };
          
          // 调用合约的readLetterWithZKProof方法
          const [success, secretWords, message, annexes] = await zkVault.readLetterWithZKProof(this.queryId, zkProofData);
          
          if (loading) loading.close();
          
          if (success) {
            // 验证成功，更新详细信息
            this.letterDetails = {
              verified: true,
              message: message,
              secretWords: secretWords,
              annexes: annexes
            };
            
            ElMessage({
              message: '信件详情获取成功！',
              type: 'success',
              duration: 3000
            });
          } else {
            ElMessage({
              message: '密码验证失败，无法查看信件详情',
              type: 'error',
              duration: 5000
            });
          }
          
        } catch (error) {
          if (loading) loading.close();
          ElMessage({
            message: `获取详情失败: ${this.handleContractError(error)}`,
            type: 'error',
            duration: 10000,
            showClose: true
          });
          console.error('获取信件详情失败:', error);
        }
      } catch (error) {
        ElMessage({
          message: `操作失败: ${error.message}`,
          type: 'error',
          duration: 5000
        });
        console.error('操作失败:', error);
      }
    },
    
    async claim() {
      try {
        // 检查钱包连接
        if (!(await this.checkAndConnectWallet())) {
          return;
        }
        
        // 检查信件ID是否为空
        if (!this.queryId) {
          ElMessage({ message: "请先查询信件ID", type: 'warning' });
          return;
        }

        // 初始化提供者和签名者
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const network = await provider.getNetwork();
        const chainId = network.chainId.toString();
        
        // 检查是否支持当前网络
        if (!ZK_CONTRACT_ADDRESS[chainId]) {
          ElMessage({ message: `不支持的网络ID: ${chainId}`, type: 'error' });
          return;
        }
        
        // 获取ZKVault合约实例
        const zkVault = new Contract(ZK_CONTRACT_ADDRESS[chainId], zkVaultAbi, provider);

        // 弹窗请求用户输入密码
        let password = this.$prompt 
          ? await this.$prompt('请输入领取密码', '密码验证', { 
              inputType: 'password',
              confirmButtonText: '确认',
              cancelButtonText: '取消'
            }) 
          : prompt('请输入领取密码');
          
        // 检查密码是否有效
        if (!password || !password.value) {
          ElMessage({ message: '密码不能为空', type: 'warning' });
          return;
        }
        password = password.value || password;
        
        // 显示加载状态
        const loading = this.$loading ? this.$loading({
          lock: true,
          text: '正在生成零知识证明...',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        }) : null;

        try {
          // 从API获取零知识证明
          const resp = await fetch(`${API_BASE_URL}/api/generate-zk-proof?password=${encodeURIComponent(password)}`);
          if (!resp.ok) {
            throw new Error(`API错误: ${resp.status}`);
          }
          const data = await resp.json();
          if (data.error) {
            throw new Error(data.error);
          }
          // proof和publicInputs与合约参数保持一致
          const zkProofData = {
            proof: data.proof.map(x => BigInt(x)),
            publicInputs: data.publicInputs.map(x => BigInt(x))
          };
          // 关闭加载状态
          if (loading) loading.close();
          // 调用合约进行领取
          const tx = await zkVault.connect(signer).claimWithZKProof(this.queryId, zkProofData);
          // 等待交易确认
          ElMessage({ message: '交易已提交，等待确认...', type: 'info' });
          await tx.wait();
          ElMessage({
            message: '信件领取成功！',
            type: 'success',
            duration: 5000
          });
          // 重置查询状态
          setTimeout(() => this.refreshQuery(), 2000);
        } catch (error) {
          if (loading) loading.close();
          ElMessage({
            message: `领取失败: ${this.handleContractError(error)}`,
            type: 'error',
            duration: 10000,
            showClose: true
          });
          console.error('领取信件失败:', error);
        }
      } catch (error) {
        ElMessage({
          message: `操作失败: ${error.message}`,
          type: 'error',
          duration: 5000
        });
        console.error('操作失败:', error);
      }
    },
    
    // 刷新查询结果
    refreshQuery() {
      this.queryAnnexsShow = [];
      this.queryLetter = {
        deadline: null,
        recipient: null,
        sender: null,
        annexAmount: null,
        id: null,
        claimed: false,
        message: "",
        secretWords: ""
      };
      this.letterDetails = {
        verified: false,
        message: "",
        secretWords: "",
        annexes: []
      };
    },
    async getLetter() {
      try {
        // 检查钱包连接
        if (!(await this.checkAndConnectWallet())) {
          return;
        }
        
        // 验证输入
        if (!this.queryId || this.queryId.trim() === "") {
          ElMessage({ message: "请输入有效的信件ID", type: 'warning' });
          return;
        }
        
        // 重置之前的查询结果
        this.refreshQuery();
        
        // 显示加载指示器
        const loading = this.$loading ? this.$loading({
          lock: true,
          text: '正在查询信件信息...',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        }) : null;
        
        // 初始化Provider和合约
        const provider = new ethers.BrowserProvider(window.ethereum);
        const network = await provider.getNetwork();
        const chainId = network.chainId.toString();
        
        // 检查是否支持当前网络
        if (!ZK_CONTRACT_ADDRESS[chainId]) {
          if (loading) loading.close();
          ElMessage({ message: `不支持的网络ID: ${chainId}`, type: 'error' });
          return;
        }
        
        const zkVault = new Contract(ZK_CONTRACT_ADDRESS[chainId], zkVaultAbi, provider);
        
        // 查询信件公开参数
        const [sender, message, deadline, passwordHash, nonce, claimed] = await zkVault.letterPublicParams(this.queryId);
        
        // 更新信件基本信息
        this.queryLetter.sender = sender;
        this.queryLetter.message = message;
        this.queryLetter.deadline = this.getFormatDate(Number(deadline) * 1000);
        this.queryLetter.id = this.queryId;
        this.queryLetter.claimed = claimed;
        
        // 查询附件信息
        const annexes = await zkVault.getLetterAnnexes(this.queryId);
        
        // 处理附件信息
        this.queryAnnexsShow = [];
        for (let i = 0; i < annexes.length; i++) {
          // 添加进度提示
          if (loading && i === 0) {
            loading.text = `正在处理附件信息 (${i+1}/${annexes.length})`;
          }
          
          // 获取格式化的附件信息
          const annexInfo = await this.getQueryShow(annexes[i], provider);
          this.queryAnnexsShow.push(annexInfo);
        }
        
        // 关闭加载指示器
        if (loading) loading.close();
        
        // 显示查询成功消息
        ElMessage({
          message: '信件查询成功',
          type: 'success',
          duration: 3000
        });
        
      } catch (error) {
        // 关闭加载指示器并显示错误
        if (this.$loading) this.$loading().close();
        
        ElMessage({ 
          message: `查询失败: ${this.handleContractError(error)}`, 
          type: 'error',
          duration: 5000,
          showClose: true
        });
        console.error('信件查询错误:', error);
      }
    },
    async getQueryShow(annex, provider) {
      const type = annex[0];
      if (type == 0) {
        const amount = BigNumber(annex[2]).div(BigNumber(10).pow(18)).decimalPlaces(6).toString()
        return { type: "ETH", amount: amount };
      }
      if (type == 1) {
        const erc20 = new Contract(annex[1], erc20Abi, provider)
        const decimals = await erc20.decimals();
        const amount = BigNumber(annex[2]).div(BigNumber(10).pow(decimals)).decimalPlaces(6).toString()
        const name = await erc20.symbol();
        return { type: "ERC20", token: annex[1], amount: amount, name: name }
      }
      if (type == 2) {
        const erc20 = new Contract(annex[1], erc20Abi, provider)
        const name = await erc20.symbol();
        return { type: "ERC721", name: name, token: annex[1], id: annex[3] }
      }
      if (type == 3) {
        return { type: "ERC1155", token: annex[1], amount: annex[2], id: annex[3] }
      };
    },
    getFormatDate(cellValue) {
      const date = new Date(parseInt(cellValue));
      const Y = date.getFullYear() + '-';
      const M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
      const D = date.getDate() + ' ';
      const h = date.getHours() + ':';
      const m = date.getMinutes() + ':';
      const s = date.getSeconds();
      return Y + M + D + h + m + s;
    },
    paymentShow() {
      return BigNumber(this.queryPayment.amount).div(BigNumber(10).pow(this.queryPayment.decimals)).decimalPlaces(6)
    },
    async sendLetter() {
      try {
        // 检查钱包连接
        if (!(await this.checkAndConnectWallet())) {
          return;
        }
        
        // 验证输入
        if (!this.receiverPassword) {
          ElMessage({ message: '请输入收件人密码', type: 'warning' });
          return;
        }
        
        if (!this.deadline) {
          ElMessage({ message: '请输入截止时间', type: 'warning' });
          return;
        }
        
        // 设置发送状态
        this.sending = true;
        this.letterId = "";
        
        // 初始化Provider和合约
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const network = await provider.getNetwork();
        const chainId = network.chainId.toString();
        
        console.log("当前连接的网络ID:", chainId);
        
        // 检查是否支持当前网络
        if (!ZK_CONTRACT_ADDRESS[chainId]) {
          this.sending = false;
          ElMessage({ message: `不支持的网络ID: ${chainId}`, type: 'error' });
          return;
        }
        
        // 1. 组装附件数据
        const annexsData = [];
        let totalEthValue = BigNumber(0);
        
        for (let i = 0; i < this.annexs.length; i++) {
          const element = this.annexs[i];
          
          // 验证附件输入
          if (element.type === "") {
            this.sending = false;
            ElMessage({ message: `请选择附件 #${i+1} 的类型`, type: 'warning' });
            return;
          }
          
          let amount = element.amount;
          let address = element.address;
          let id = element.id || "0";
          
          // ETH附件
          if (element.type == 0) {
            if (!element.amount) {
              this.sending = false;
              ElMessage({ message: '请输入ETH数量', type: 'warning' });
              return;
            }
            
            totalEthValue = totalEthValue.plus(BigNumber(amount).multipliedBy(BigNumber(10).pow(18)));
            amount = BigNumber(amount).multipliedBy(BigNumber(10).pow(18)).toFixed(0);
            address = ethers.ZeroAddress;
            id = "0";
          }
          // ERC20附件
          else if (element.type == 1) {
            if (!element.address || !element.amount) {
              this.sending = false;
              ElMessage({ message: '请输入ERC20代币地址和数量', type: 'warning' });
              return;
            }
            
            // 检查授权状态
            if (element.allowanceStatus === 'insufficient') {
              this.sending = false;
              ElMessage({ message: '请先授权ERC20代币', type: 'warning' });
              return;
            }
            
            const erc20 = new Contract(element.address, erc20Abi, provider);
            const decimals = await erc20.decimals();
            amount = BigNumber(amount).multipliedBy(BigNumber(10).pow(decimals)).toFixed(0);
            id = "0";
            
            // 最后再次检查授权（防止状态不一致）
            const currentAllowance = await erc20.allowance(await signer.getAddress(), ZK_CONTRACT_ADDRESS[chainId]);
            if (BigInt(currentAllowance) < BigInt(amount)) {
              this.sending = false;
              ElMessage({ message: '授权不足，请重新授权', type: 'warning' });
              return;
            }
          }
          // ERC721附件
          else if (element.type == 2) {
            if (!element.address || !element.id) {
              this.sending = false;
              ElMessage({ message: '请输入ERC721合约地址和Token ID', type: 'warning' });
              return;
            }
            amount = "0";
          }
          // ERC1155附件
          else if (element.type == 3) {
            if (!element.address || !element.id || !element.amount) {
              this.sending = false;
              ElMessage({ message: '请输入ERC1155合约地址、Token ID和数量', type: 'warning' });
              return;
            }
          }
          
          annexsData.push({
            _type: parseInt(element.type),
            _address: address,
            _amount: amount,
            _id: id
          });
        }
        
        // 转换为BigInt
        const ethValue = BigInt(totalEthValue.toFixed(0));
        
        // 2. 获取密码并生成哈希
        const password = this.receiverPassword;
        
        // 从API获取密码哈希
        let passwordHash;
        try {
          console.log("正在获取密码哈希...", { password });
          const resp = await fetch(`${API_BASE_URL}/api/generate-password-hash?password=${encodeURIComponent(password)}`);
          
          console.log("API响应状态:", resp.status);
          
          if (!resp.ok) {
            throw new Error(`API错误: ${resp.status}`);
          }
          
          const data = await resp.json();
          console.log("API响应数据:", data);
          
          if (data.error) {
            throw new Error(data.error);
          }
          
          passwordHash = data.passwordHash;
          console.log("获取到的密码哈希:", passwordHash);
          
        } catch (error) {
          console.error("密码哈希生成失败:", error);
          this.sending = false;
          ElMessage({ message: `密码哈希生成失败: ${error.message}`, type: 'error' });
          return;
        }
        
        // 3. 准备nonce（时间戳）
        const nonce = Math.floor(Date.now() / 1000);
        
        // 4. 调用ZKVault合约的sendLetter方法
        const zkVault = new Contract(ZK_CONTRACT_ADDRESS[chainId], zkVaultAbi, provider);
        
        try {
          // 使用组件中的信件内容和密语
          const message = this.letterMessage || "";
          const secretWords = this.secretWords || "";
          
          console.log("发送交易参数:", {
            annexsData,
            message,
            secretWords,
            passwordHash,
            deadline: parseInt(this.deadline),
            nonce,
            ethValue: ethValue.toString()
          });
          
          // 发送交易
          const tx = await zkVault.connect(signer).sendLetter(
            annexsData,
            message,
            secretWords,
            passwordHash,
            parseInt(this.deadline), // 确保deadline是数字
            nonce,
            { value: ethValue }
          );
          
          ElMessage({ message: '交易已提交，等待确认...', type: 'info' });
          
          // 等待交易确认
          const receipt = await tx.wait();
          
          // 从事件中获取信件ID
          for (const log of receipt.logs) {
            try {
              // 尝试解析事件
              const parsedLog = zkVault.interface.parseLog(log);
              if (parsedLog && parsedLog.name === 'SendLetter') {
                this.letterId = parsedLog.args[0]; // _letterId
                break;
              }
            } catch (e) {
              // 忽略解析失败的日志
              continue;
            }
          }
          
          // 如果未能从日志中找到ID，使用收据哈希作为备选
          if (!this.letterId) {
            this.letterId = receipt.hash;
          }
          
          ElMessage({
            message: '信件发送成功！',
            type: 'success',
            duration: 5000
          });
          
        } catch (error) {
          console.error("发送交易详细错误:", error);
          console.log("错误类型:", typeof error);
          console.log("错误堆栈:", error.stack);
          if (error.reason) console.log("错误原因:", error.reason);
          if (error.code) console.log("错误代码:", error.code);
          if (error.data) console.log("错误数据:", error.data);
          
          ElMessage({ 
            message: `发送失败: ${this.handleContractError(error)}`, 
            type: 'error',
            duration: 10000,
            showClose: true
          });
          console.error('发送信件错误:', error);
        }
        
      } catch (error) {
        ElMessage({ 
          message: `操作异常: ${error.message}`, 
          type: 'error',
          duration: 5000 
        });
        console.error('发送信件异常:', error);
      } finally {
        this.sending = false;
      }
    },
    async testSendSimple() {
      try {
        // 检查钱包连接
        if (!(await this.checkAndConnectWallet())) {
          return;
        }
        
        // 设置发送状态
        this.sending = true;
        this.letterId = "";
        
        // 初始化Provider和合约
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const network = await provider.getNetwork();
        const chainId = network.chainId.toString();
        
        console.log("当前连接的网络ID:", chainId);
        
        // 检查是否支持当前网络
        if (!ZK_CONTRACT_ADDRESS[chainId]) {
          this.sending = false;
          ElMessage({ message: `不支持的网络ID: ${chainId}`, type: 'error' });
          return;
        }
        
        // 固定测试参数
        const testPassword = "test123";
        const testDeadline = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60); // 7天后
        
        // 创建简单的ETH附件
        const annexsData = [{
          _type: 0, // ETH
          _address: ethers.ZeroAddress,
          _amount: ethers.parseEther("0.001").toString(), // 0.001 ETH
          _id: "0"
        }];
        
        console.log("测试附件数据:", annexsData);
        
        // 从API获取密码哈希
        let passwordHash;
        try {
          console.log("正在获取密码哈希...", { password: testPassword });
          const resp = await fetch(`${API_BASE_URL}/api/generate-password-hash?password=${encodeURIComponent(testPassword)}`);
          
          console.log("API响应状态:", resp.status);
          
          if (!resp.ok) {
            throw new Error(`API错误: ${resp.status}`);
          }
          
          const data = await resp.json();
          console.log("API响应数据:", data);
          
          passwordHash = data.passwordHash;
          console.log("获取到的密码哈希:", passwordHash);
          
        } catch (error) {
          console.error("密码哈希生成失败:", error);
          this.sending = false;
          ElMessage({ message: `密码哈希生成失败: ${error.message}`, type: 'error' });
          return;
        }
        
        // 准备nonce（时间戳）
        const nonce = Math.floor(Date.now() / 1000);
        
        // 调用ZKVault合约的sendLetter方法
        const zkVault = new Contract(ZK_CONTRACT_ADDRESS[chainId], zkVaultAbi, provider);
        
        try {
          console.log("测试发送交易参数:", {
            annexsData,
            message: "测试消息",
            secretWords: "测试密语",
            passwordHash,
            deadline: testDeadline,
            nonce,
            ethValue: ethers.parseEther("0.001").toString()
          });
          
          // 发送交易
          const tx = await zkVault.connect(signer).sendLetter(
            annexsData,
            "测试消息",
            "测试密语",
            passwordHash,
            testDeadline,
            nonce,
            { value: ethers.parseEther("0.001") }
          );
          
          ElMessage({ message: '测试交易已提交，等待确认...', type: 'info' });
          
          // 等待交易确认
          const receipt = await tx.wait();
          console.log("交易收据:", receipt);
          
          // 从事件中获取信件ID
          for (const log of receipt.logs) {
            try {
              const parsedLog = zkVault.interface.parseLog(log);
              if (parsedLog && parsedLog.name === 'SendLetter') {
                this.letterId = parsedLog.args[0];
                break;
              }
            } catch (e) {
              continue;
            }
          }
          
          if (!this.letterId) {
            this.letterId = receipt.hash;
          }
          
          ElMessage({
            message: `测试信件发送成功！密码: ${testPassword}`,
            type: 'success',
            duration: 8000
          });
          
        } catch (error) {
          console.error("测试发送交易详细错误:", error);
          ElMessage({ 
            message: `测试发送失败: ${this.handleContractError(error)}`, 
            type: 'error',
            duration: 10000,
            showClose: true
          });
        }
        
      } catch (error) {
        ElMessage({ 
          message: `测试操作异常: ${error.message}`, 
          type: 'error',
          duration: 5000 
        });
        console.error('测试发送信件异常:', error);
      } finally {
        this.sending = false;
      }
    },
    deleteAnnex(index) {
      if (this.annexs.length <= 1) {
        return false
      }
      this.annexs.splice(index, 1)
    },
    addAnnex() {
      this.annexs.push(
        {
          type: "",
          address: "",
          amount: "",
          id: "0",
          tokenName: "", // ERC20代币名称
          allowanceStatus: null, // 授权状态: null, 'sufficient', 'insufficient'
          approving: false, // 是否正在授权
          decimals: 18 // 代币精度
        }
      )
    },
    // 复制文本到剪贴板
    copyToClipboard(text) {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text)
          .then(() => {
            ElMessage({
              message: '已复制到剪贴板',
              type: 'success',
              duration: 2000
            });
          })
          .catch(err => {
            ElMessage({
              message: `复制失败: ${err}`,
              type: 'error',
              duration: 3000
            });
            console.error('复制失败:', err);
          });
      } else {
        // 备用方法
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
          document.execCommand('copy');
          ElMessage({
            message: '已复制到剪贴板',
            type: 'success',
            duration: 2000
          });
        } catch (err) {
          ElMessage({
            message: `复制失败: ${err}`,
            type: 'error',
            duration: 3000
          });
          console.error('复制失败:', err);
        }
        
        document.body.removeChild(textArea);
      }
    },
    
    // 根据附件类型返回对应的标签颜色
    getAnnexTypeColor(type) {
      const colorMap = {
        'ETH': 'primary',
        'ERC20': 'success',
        'ERC721': 'warning',
        'ERC1155': 'danger'
      };
      return colorMap[type] || 'info';
    },
    
    // 获取附件状态图标
    getAnnexStatusIcon(item) {
      if (item.type === 1) { // ERC20
        if (item.allowanceStatus === 'sufficient') {
          return '✅';
        } else if (item.allowanceStatus === 'insufficient') {
          return '⚠️';
        }
      }
      return '';
    },
    
    // 获取附件状态描述
    getAnnexStatusText(item) {
      if (item.type === 1) { // ERC20
        if (item.allowanceStatus === 'sufficient') {
          return '已授权';
        } else if (item.allowanceStatus === 'insufficient') {
          return '需要授权';
        }
      }
      return '';
    },
    
    // 处理智能合约错误，提供更友好的错误信息
    handleContractError(error) {
      let errorMessage = error.message;
      
      // 处理常见合约错误
      if (errorMessage.includes('LetterNotExists')) {
        return '信件不存在';
      } else if (errorMessage.includes('LetterAlreadyClaimed')) {
        return '信件已被领取';
      } else if (errorMessage.includes('LetterExpired')) {
        return '信件已过期';
      } else if (errorMessage.includes('InvalidProof')) {
        return '无效的ZK证明，密码可能不正确';
      } else if (errorMessage.includes('user rejected transaction')) {
        return '用户拒绝了交易';
      } else if (errorMessage.includes('insufficient funds')) {
        return '账户余额不足';
      }
      
      // 显示原始错误信息
      return errorMessage;
    },
    
    // 检查并请求MetaMask连接
    async checkAndConnectWallet() {
      if (!window.ethereum) {
        ElMessage({
          message: '未检测到MetaMask，请安装MetaMask扩展',
          type: 'error',
          duration: 5000,
          showClose: true
        });
        return false;
      }
      
      try {
        // 请求连接
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length === 0) {
          ElMessage({
            message: '未连接到任何账户，请在MetaMask中允许连接',
            type: 'warning',
            duration: 5000
          });
          return false;
        }
        
        // 检查当前网络
        const provider = new ethers.BrowserProvider(window.ethereum);
        const network = await provider.getNetwork();
        const chainId = network.chainId.toString();
        
        if (!ZK_CONTRACT_ADDRESS[chainId]) {
          ElMessage({
            message: `当前网络(ID: ${chainId})不支持，请切换到Hardhat本地网络(31337)或其他支持的网络`,
            type: 'warning',
            duration: 7000,
            showClose: true
          });
          return false;
        }
        
        return true;
      } catch (error) {
        ElMessage({
          message: `钱包连接失败: ${error.message}`,
          type: 'error',
          duration: 5000
        });
        return false;
      }
    },
    clearLetterDetails() {
      this.letterDetails = {
        verified: false,
        message: "",
        secretWords: "",
        annexes: []
      };
      ElMessage({
        message: '信件详情已清除',
        type: 'info',
        duration: 2000
      });
    },
    // 处理附件类型变化
    onAnnexTypeChange(item, index) {
      if (item.type === 1) { // ERC20
        // 自动填入测试代币地址
        item.address = this.TEST_TOKEN_ADDRESS;
        item.tokenName = "";
        item.allowanceStatus = null;
        item.approving = false;
        item.decimals = 18;
        
        // 检查代币信息
        this.checkTokenInfo(item, index);
      } else {
        // 重置ERC20相关状态
        item.tokenName = "";
        item.allowanceStatus = null;
        item.approving = false;
        item.decimals = 18;
      }
    },
    
    // 处理地址变化
    async onAddressChange(item, index) {
      if (item.type === 1 && item.address) {
        await this.checkTokenInfo(item, index);
      }
    },
    
    // 处理数量变化
    async onAmountChange(item, index) {
      if (item.type === 1 && item.address && item.amount) {
        await this.checkAllowance(item, index);
      }
    },
    
    // 检查代币信息
    async checkTokenInfo(item, index) {
      try {
        if (!(await this.checkAndConnectWallet())) {
          return;
        }
        
        const provider = new ethers.BrowserProvider(window.ethereum);
        const network = await provider.getNetwork();
        const chainId = network.chainId.toString();
        
        if (!ZK_CONTRACT_ADDRESS[chainId]) {
          return;
        }
        
        const erc20 = new Contract(item.address, erc20Abi, provider);
        
        // 获取代币信息
        const [name, symbol, decimals] = await Promise.all([
          erc20.name(),
          erc20.symbol(),
          erc20.decimals()
        ]);
        
        item.tokenName = `${name} (${symbol})`;
        item.decimals = decimals;
        
        // 检查授权状态
        if (item.amount) {
          await this.checkAllowance(item, index);
        }
        
      } catch (error) {
        console.error('检查代币信息失败:', error);
        item.tokenName = "无效代币";
        item.allowanceStatus = null;
      }
    },
    
    // 检查授权状态
    async checkAllowance(item, index) {
      try {
        if (!(await this.checkAndConnectWallet()) || !item.address || !item.amount) {
          return;
        }
        
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const userAddress = await signer.getAddress();
        const network = await provider.getNetwork();
        const chainId = network.chainId.toString();
        
        if (!ZK_CONTRACT_ADDRESS[chainId]) {
          return;
        }
        
        const erc20 = new Contract(item.address, erc20Abi, provider);
        const vaultAddress = ZK_CONTRACT_ADDRESS[chainId];
        
        // 获取当前授权额度
        const currentAllowance = await erc20.allowance(userAddress, vaultAddress);
        
        // 将用户输入的数量转换为wei
        const requiredAmount = BigNumber(item.amount).multipliedBy(BigNumber(10).pow(item.decimals));
        
        // 比较授权额度
        if (BigInt(currentAllowance) >= BigInt(requiredAmount.toFixed(0))) {
          item.allowanceStatus = 'sufficient';
        } else {
          item.allowanceStatus = 'insufficient';
        }
        
      } catch (error) {
        console.error('检查授权状态失败:', error);
        item.allowanceStatus = 'insufficient';
      }
    },
    
    // 授权代币
    async approveToken(item, index) {
      try {
        if (!(await this.checkAndConnectWallet())) {
          return;
        }
        
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const network = await provider.getNetwork();
        const chainId = network.chainId.toString();
        
        if (!ZK_CONTRACT_ADDRESS[chainId]) {
          ElMessage({ message: `不支持的网络ID: ${chainId}`, type: 'error' });
          return;
        }
        
        const erc20 = new Contract(item.address, erc20Abi, signer);
        const vaultAddress = ZK_CONTRACT_ADDRESS[chainId];
        
        // 设置授权状态
        item.approving = true;
        
        // 授权最大数量
        const maxAmount = ethers.MaxUint256;
        
        ElMessage({ message: '正在提交授权交易...', type: 'info' });
        
        const tx = await erc20.approve(vaultAddress, maxAmount);
        
        ElMessage({ message: '授权交易已提交，等待确认...', type: 'info' });
        
        await tx.wait();
        
        // 重新检查授权状态
        await this.checkAllowance(item, index);
        
        ElMessage({ 
          message: '代币授权成功！', 
          type: 'success',
          duration: 3000
        });
        
      } catch (error) {
        console.error('授权失败:', error);
        ElMessage({ 
          message: `授权失败: ${this.handleContractError(error)}`, 
          type: 'error',
          duration: 5000
        });
      } finally {
        item.approving = false;
      }
    },
    
    // ...existing code...
  },
  mounted() {
    // 组件加载时尝试连接钱包
    this.checkAndConnectWallet();
  }
}

</script>