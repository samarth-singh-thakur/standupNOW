#!/usr/bin/env python3
"""
Create premium yellow icons for StandupNow extension
"""
from PIL import Image, ImageDraw
import math

def create_premium_yellow_icon(size):
    """Create a premium yellow icon with clock/standup theme"""
    # Create image with transparent background
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Premium yellow color palette
    primary_yellow = (255, 193, 7)      # #FFC107 - Vibrant yellow
    dark_yellow = (255, 160, 0)         # #FFA000 - Darker accent
    light_yellow = (255, 224, 130)      # #FFE082 - Light highlight
    shadow = (0, 0, 0, 40)              # Semi-transparent shadow
    
    # Calculate dimensions
    center = size // 2
    padding = size // 8
    outer_radius = center - padding
    
    # Draw shadow for depth
    shadow_offset = size // 40
    draw.ellipse(
        [padding + shadow_offset, padding + shadow_offset, 
         size - padding + shadow_offset, size - padding + shadow_offset],
        fill=shadow
    )
    
    # Draw outer circle (main background)
    draw.ellipse(
        [padding, padding, size - padding, size - padding],
        fill=primary_yellow,
        outline=dark_yellow,
        width=max(2, size // 32)
    )
    
    # Draw inner circle for depth
    inner_padding = padding + size // 16
    draw.ellipse(
        [inner_padding, inner_padding, size - inner_padding, size - inner_padding],
        fill=light_yellow,
        outline=dark_yellow,
        width=max(1, size // 64)
    )
    
    # Draw clock face markers (12 positions)
    marker_radius = outer_radius - size // 10
    marker_size = max(2, size // 40)
    
    for i in range(12):
        angle = math.radians(i * 30 - 90)  # Start from top (12 o'clock)
        x = center + marker_radius * math.cos(angle)
        y = center + marker_radius * math.sin(angle)
        
        # Emphasize 12, 3, 6, 9 positions
        if i % 3 == 0:
            marker_width = marker_size * 2
            marker_height = size // 20
        else:
            marker_width = marker_size
            marker_height = size // 30
        
        draw.ellipse(
            [x - marker_width, y - marker_height, 
             x + marker_width, y + marker_height],
            fill=dark_yellow
        )
    
    # Draw clock hands
    hand_width = max(2, size // 32)
    
    # Hour hand (pointing to 10 o'clock - standup time!)
    hour_angle = math.radians(10 * 30 - 90)
    hour_length = outer_radius * 0.5
    hour_x = center + hour_length * math.cos(hour_angle)
    hour_y = center + hour_length * math.sin(hour_angle)
    draw.line(
        [(center, center), (hour_x, hour_y)],
        fill=dark_yellow,
        width=hand_width * 2
    )
    
    # Minute hand (pointing to 12 - on the hour)
    minute_angle = math.radians(-90)
    minute_length = outer_radius * 0.7
    minute_x = center + minute_length * math.cos(minute_angle)
    minute_y = center + minute_length * math.sin(minute_angle)
    draw.line(
        [(center, center), (minute_x, minute_y)],
        fill=dark_yellow,
        width=hand_width
    )
    
    # Draw center dot
    center_dot_size = max(3, size // 20)
    draw.ellipse(
        [center - center_dot_size, center - center_dot_size,
         center + center_dot_size, center + center_dot_size],
        fill=dark_yellow
    )
    
    # Add subtle highlight for premium look
    highlight_size = size // 6
    highlight_pos = padding + size // 8
    draw.ellipse(
        [highlight_pos, highlight_pos,
         highlight_pos + highlight_size, highlight_pos + highlight_size],
        fill=(255, 255, 255, 60)
    )
    
    return img

# Create all required icon sizes
sizes = [16, 32, 48, 128]

for size in sizes:
    print(f"Creating {size}x{size} icon...")
    icon = create_premium_yellow_icon(size)
    icon.save(f'images/icon-{size}.png', 'PNG')
    print(f"✓ Saved images/icon-{size}.png")

# Create a larger version for reference
print("Creating 512x512 reference icon...")
icon_large = create_premium_yellow_icon(512)
icon_large.save('images/icon.png', 'PNG')
print("✓ Saved images/icon.png")

print("\n✨ All premium yellow icons created successfully!")

# Made with Bob
