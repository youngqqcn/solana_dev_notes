from matplotlib.ticker import FormatStrFormatter
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.ticker as ticker

# 定义函数
def token_supply(x):
    return 1073000191 - 32190000000 / (30 + x)

# 计算导数 dy/dx
def derivative_token_supply(x):
    return 32190000000 / (30 + x)**2

# 计算价格 dx/dy = 1 / (dy/dx)
def token_price(x):
    dy_dx = derivative_token_supply(x)
    return 1 / dy_dx

# 生成数据点，确保x从0开始且不能为负数
x = np.linspace(0, 105, 100000)
y = token_supply(x)
z = token_price(x)

# 创建绘图
fig, ax1 = plt.subplots()

# 绘制 token 的供应量曲线
ax1.plot(x, y, 'b-', label='y/已卖出Token的总数量')
ax1.set_xlabel('x/内盘交易池子中SOL总数量')
ax1.set_ylabel('y/卖出的Token的总数量', color='b')
ax1.tick_params(axis='y', labelcolor='b')
ax1.set_xlim([0, 105])  # 确保x轴从0开始
ax1.set_ylim([0, max(y) * 1.6])  # 确保y轴从0开始，并稍微增加上限
ax1.grid(True)
ax1.yaxis.set_major_formatter(FormatStrFormatter('%.1e'))
ax1.yaxis.set_major_locator(ticker.MultipleLocator(1e+8))
ax1.xaxis.set_major_locator(ticker.MultipleLocator(10))

# 创建第二个y轴并绘制 token 的价格曲线
ax2 = ax1.twinx()
ax2.plot(x, z, 'r-', label='z/Token的市场价格(SOL)')
ax2.set_ylabel('z/Token的市场价格(SOL)', color='r')
ax2.tick_params(axis='y', labelcolor='r')
ax2.set_ylim([0, max(z) * 1.1])  # 确保z轴从0开始，并稍微增加上限
# ax2.grid(True)


# 设置右y轴的刻度格式
ax2.yaxis.set_major_formatter(FormatStrFormatter('%.1e'))

# 在 x = 85 处添加虚线
x_val = 32190000000/(1073000191 - 793100000) - 30
ax1.axvline(x=x_val, color='green', linestyle='--')

# 总量 10 亿
ax1.axhline(y=1e9, color='blue', linestyle=':')

# 找到与 x = 85 对应的 y 和 z 值
y_val = np.interp(x_val, x, y)
z_val = np.interp(x_val, x, z)

# 在曲线上标记交点
ax1.plot(x_val, y_val, 'bo')
ax1.text(x_val+0.5, y_val -0.25e8, f'({x_val:.9f},{y_val: .0f})', color='blue', fontsize=10)

ax2.plot(x_val, z_val, 'ro')
ax2.text(x_val+1, z_val  , f'({x_val:.9f},{z_val:.10f})', color='red', fontsize=10, )



# 绘制初始价格交点
init_price_val = np.interp(0, x, z)
ax2.plot(0, init_price_val, 'ro')
ax2.text(0 + 1, init_price_val - 0.1e-7  , f'初始价格 (0,{init_price_val:.10f})', color='red', fontsize=10, )

ax2.axhline(y=init_price_val, color='red', linestyle=":")

ax1.plot(0, 0, 'bo')
# ax1.text(0 + 1, 0, f'初始供应量 (0, 0)', color='blue', fontsize=10)


# 添加图例
fig.tight_layout()
ax1.legend(loc='upper left')
ax2.legend(loc='upper right')

# 显示图表
plt.title('FanslandAI Bonding Curve')
plt.show()


