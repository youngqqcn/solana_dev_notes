from matplotlib.ticker import FormatStrFormatter
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.ticker as ticker

# 定义函数
def token_supply(x):
    return 1073000191 - 32190005730 / (30 + x)

# 计算导数 dy/dx
def derivative_token_supply(x):
    return 32190005730 / (30 + x)**2

# 计算价格 dx/dy = 1 / (dy/dx)
def token_price(x):
    dy_dx = derivative_token_supply(x)
    return 1 / dy_dx

# 生成数据点，确保x从0开始且不能为负数
x = np.linspace(0, 100, 100)
y = token_supply(x)
z = token_price(x)

# 创建绘图
fig, ax1 = plt.subplots()

# 绘制 token 的供应量曲线
ax1.plot(x, y, 'b-', label='y/已Mint的Token的总数量')
ax1.set_xlabel('x/池子中SOL总数量')
ax1.set_ylabel('y/已Mint的Token的总数量', color='b')
ax1.tick_params(axis='y', labelcolor='b')
ax1.set_xlim([0, 90])  # 确保x轴从0开始
ax1.set_ylim([0, max(y) * 1.3])  # 确保y轴从0开始，并稍微增加上限
ax1.grid(True)
ax1.yaxis.set_major_formatter(FormatStrFormatter('%.1e'))
ax1.yaxis.set_major_locator(ticker.MultipleLocator(1e+8))
ax1.xaxis.set_major_locator(ticker.MultipleLocator(10))

# 创建第二个y轴并绘制 token 的价格曲线
ax2 = ax1.twinx()
ax2.plot(x, z, 'r-', label='z/价格 (dx/dy)')
ax2.set_ylabel('z/价格 (dx/dy)', color='r')
ax2.tick_params(axis='y', labelcolor='r')
ax2.set_ylim([0, max(z) * 1.0])  # 确保z轴从0开始，并稍微增加上限
# ax2.grid(True)

# 设置右y轴的刻度格式
ax2.yaxis.set_major_formatter(FormatStrFormatter('%.1e'))

# 在 x = 85 处添加虚线
x_val = 85
ax1.axvline(x=x_val, color='green', linestyle='--')

# 找到与 x = 85 对应的 y 和 z 值
y_val = np.interp(x_val, x, y)
z_val = np.interp(x_val, x, z)

# 在曲线上标记交点
ax1.plot(x_val, y_val, 'bo')
ax1.text(x_val-3, y_val - 0.3e8, f'({x_val:.0f},{y_val: .0f})', color='blue', fontsize=10)

ax2.plot(x_val, z_val, 'ro')
ax2.text(x_val-7, z_val + 0.1e-7 , f'({x_val:.0f},{z_val:.10f})', color='red', fontsize=10, )



# 绘制初始价格交点
init_price_val = np.interp(0, x, z)
ax2.plot(0, init_price_val, 'ro')
ax2.text(0, init_price_val - 0.1e-7  , f'(0,{init_price_val:.10f})', color='red', fontsize=10, )

# 添加图例
fig.tight_layout()
ax1.legend(loc='upper left')
ax2.legend(loc='upper right')

# 显示图表
plt.title('PUMP.FUN Bonding Curve 定价曲线, y=1073000191-32190005730/(30+x)')
plt.show()
