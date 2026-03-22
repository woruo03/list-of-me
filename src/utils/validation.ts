// 表单验证工具函数

export const validateTaskTitle = (title: string): { valid: boolean; message?: string } => {
  if (!title.trim()) {
    return { valid: false, message: '任务标题不能为空' }
  }

  if (title.length > 200) {
    return { valid: false, message: '任务标题不能超过200个字符' }
  }

  return { valid: true }
}

export const validateProjectName = (name: string): { valid: boolean; message?: string } => {
  if (!name.trim()) {
    return { valid: false, message: '项目名称不能为空' }
  }

  if (name.length > 100) {
    return { valid: false, message: '项目名称不能超过100个字符' }
  }

  return { valid: true }
}

export const validateDescription = (
  description: string | null,
): { valid: boolean; message?: string } => {
  if (!description) return { valid: true }

  if (description.length > 1000) {
    return { valid: false, message: '描述不能超过1000个字符' }
  }

  return { valid: true }
}

export const validateDueDate = (dueAt: string | null): { valid: boolean; message?: string } => {
  if (!dueAt) return { valid: true }

  const date = new Date(dueAt)

  if (isNaN(date.getTime())) {
    return { valid: false, message: '无效的日期格式' }
  }

  // 截止时间不能早于当前时间（允许过去的时间，但会显示为过期）
  // 这里不做限制，因为用户可能想记录过去的任务

  return { valid: true }
}

export const validateEmail = (email: string): { valid: boolean; message?: string } => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!email.trim()) {
    return { valid: false, message: '邮箱不能为空' }
  }

  if (!emailRegex.test(email)) {
    return { valid: false, message: '请输入有效的邮箱地址' }
  }

  return { valid: true }
}

export const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (!password.trim()) {
    return { valid: false, message: '密码不能为空' }
  }

  if (password.length < 6) {
    return { valid: false, message: '密码至少需要6个字符' }
  }

  if (password.length > 50) {
    return { valid: false, message: '密码不能超过50个字符' }
  }

  return { valid: true }
}

export const validateUrl = (url: string): { valid: boolean; message?: string } => {
  if (!url.trim()) return { valid: true }

  try {
    new URL(url)
    return { valid: true }
  } catch {
    return { valid: false, message: '请输入有效的URL地址' }
  }
}

// 通用验证器
interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: any) => { valid: boolean; message?: string }
}

export const validateField = (
  value: any,
  rules: ValidationRule,
): { valid: boolean; message?: string } => {
  // 必填验证
  if (rules.required) {
    if (value === null || value === undefined || value === '') {
      return { valid: false, message: '此字段为必填项' }
    }
    if (typeof value === 'string' && !value.trim()) {
      return { valid: false, message: '此字段为必填项' }
    }
  }

  // 最小长度验证
  if (rules.minLength && typeof value === 'string') {
    if (value.length < rules.minLength) {
      return {
        valid: false,
        message: `至少需要${rules.minLength}个字符`,
      }
    }
  }

  // 最大长度验证
  if (rules.maxLength && typeof value === 'string') {
    if (value.length > rules.maxLength) {
      return {
        valid: false,
        message: `不能超过${rules.maxLength}个字符`,
      }
    }
  }

  // 正则表达式验证
  if (rules.pattern && typeof value === 'string') {
    if (!rules.pattern.test(value)) {
      return { valid: false, message: '格式不正确' }
    }
  }

  // 自定义验证
  if (rules.custom) {
    return rules.custom(value)
  }

  return { valid: true }
}
