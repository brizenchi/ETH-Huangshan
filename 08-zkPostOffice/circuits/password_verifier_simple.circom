/**
 * @title PasswordVerifier
 * @dev 简化的ZK电路用于验证密码知识
 * 不使用外部库，只验证密码哈希匹配
 */
template PasswordVerifier() {
    // 私密输入
    signal private input password;
    
    // 公共输入  
    signal input passwordHash;
    
    // 输出
    signal output isValid;
    
    // 简单的哈希验证（用乘法模拟）
    signal passwordSquared;
    passwordSquared <== password * password;
    
    // 验证密码的平方是否等于预期哈希
    component equal = IsEqual();
    equal.in[0] <== passwordSquared;
    equal.in[1] <== passwordHash;
    
    isValid <== equal.out;
}

template IsEqual() {
    signal input in[2];
    signal output out;
    
    component isz = IsZero();
    isz.in <== in[1] - in[0];
    out <== isz.out;
}

template IsZero() {
    signal input in;
    signal output out;
    
    signal inv;
    inv <-- in!=0 ? 1/in : 0;
    out <== -in*inv +1;
    in*out === 0;
}

component main = PasswordVerifier();
