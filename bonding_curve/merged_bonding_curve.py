

# Updated functions with the new definition for func2
from matplotlib import pyplot as plt
import numpy as np
from scipy.optimize import fsolve

import numpy as np
import matplotlib.pyplot as plt

# Define the functions
def func1(x):
    return 1073000000 - (1073000000 * 30) / (30 + x)

def func2(x):
    return 1000000000 - (206900000 * 79) / x

def func3(x):
    return 1000000000 - (1000000000 * 21) / (21 + x)

# Generate x values for each function
x1 = np.linspace(0, 85, 500)  # 0 <= x <= 85 for func1
x2 = np.linspace(80, 500, 500)  # 79 < x < 500 for func2
x3 = np.linspace(0.1, 500, 500)  # 0 < x < 500 for func3 (avoid division by zero)

# Compute y values for each function
y1 = func1(x1)
y2 = func2(x2)
y3 = func3(x3)

# Create the plot
plt.figure(figsize=(12, 8))

# Plot each function
plt.plot(x1, y1, label=r'内盘曲线(旧): $y = 1073000000 - \frac{1073000000 \cdot 30}{30 + x}$', color='blue')
plt.plot(x2, y2, label=r'外盘曲线(旧): $y = 1000000000 - \frac{206900000 \cdot 79}{x}$', color='red')
plt.plot(x3, y3, label=r'合并之后(新): $y = 1000000000 - \frac{1000000000 \cdot 21}{21 + x}$', color='green')

# Add labels, legend, and title
plt.xlabel('x(池子中SOL的数量)', fontsize=12)
plt.ylabel('y(已售出token数量)', fontsize=12)
plt.title('内外盘合并-函数曲线图', fontsize=14)
plt.axhline(0, color='black', linestyle='--', linewidth=0.8)  # Highlight y=0
plt.legend(fontsize=10)
plt.grid(True)
plt.ylim([0, 1.1 * max(np.max(y1), np.max(y2), np.max(y3))])  # Set y-limits for better visualization

# Show the plot
plt.show()
