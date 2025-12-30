/**
 * Shared Constants
 * 共享常量和枚举
 */

// 图片来源优先级
const IMAGE_SOURCES = {
  OFFICIAL: 'official',
  RETAILER: 'retailer',
  SEARCH: 'search',
  PLACEHOLDER: 'placeholder'
};

// 零售商配置
const RETAILERS = {
  GOULET: {
    name: 'Goulet Pens',
    domain: 'gouletpens.com',
    priority: 1
  },
  JETPENS: {
    name: 'JetPens',
    domain: 'jetpens.com',
    priority: 2
  },
  ANDERSON: {
    name: 'Anderson Pens',
    domain: 'andersonpens.com',
    priority: 3
  },
  CULTPENS: {
    name: 'Cult Pens',
    domain: 'cultpens.com',
    priority: 4
  }
};

// 品牌官网
const BRAND_WEBSITES = {
  Pelikan: 'https://www.pelikan.com',
  Montblanc: 'https://www.montblanc.com',
  Pilot: 'https://www.pilot.co.jp',
  Sailor: 'https://sailor.co.jp',
  Lamy: 'https://www.lamy.com',
  Kaweco: 'https://www.kaweco-pen.com',
  TWSBI: 'https://www.twsbi.com',
  Platinum: 'https://www.platinum-pen.co.jp',
  Waterman: 'https://www.waterman.com',
  Parker: 'https://www.parkerpen.com'
};

// 数据验证规则
const VALIDATION_RULES = {
  PEN: {
    required: ['id', 'brand', 'name'],
    optional: ['model', 'series', 'description', 'specifications', 'images']
  },
  INK: {
    required: ['id', 'brand', 'name', 'color'],
    optional: ['series', 'description', 'type', 'properties']
  }
};

// 默认配置
const DEFAULTS = {
  IMAGE_WIDTH: 800,
  IMAGE_HEIGHT: 600,
  REQUEST_TIMEOUT: 10000,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000
};

module.exports = {
  IMAGE_SOURCES,
  RETAILERS,
  BRAND_WEBSITES,
  VALIDATION_RULES,
  DEFAULTS
};
