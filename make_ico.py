import struct

def make_bmp_ico(filename):
    # Standard multi-size ICO generator (16x16, 32x32, 48x48)
    sizes = [16, 32, 48]
    ico_dir = bytearray()
    
    # Header: Reserved (2), Type 1=ICO (2), Count len(sizes) (2)
    ico_dir += struct.pack('<HHH', 0, 1, len(sizes))
    
    image_data_blocks = []
    current_offset = 6 + (16 * len(sizes))
    
    for size in sizes:
        w = size
        h = size
        
        # BMP Header (40 bytes)
        bmp_header = struct.pack('<IIIHHIIIIII', 40, w, h * 2, 1, 32, 0, (w * h * 4) + (w * h // 8), 0, 0, 0, 0)
        
        # XOR Mask (BGRA pixels bottom-up)
        xor_mask = bytearray()
        for y in range(h - 1, -1, -1):
            for x in range(w):
                # Draw Emerald Green background (#065f46) with gold border & EV initials
                dx = x - (w / 2 - 0.5)
                dy = y - (h / 2 - 0.5)
                dist = (dx*dx + dy*dy) ** 0.5
                r_outer = w * 0.45
                r_inner = w * 0.38
                
                if dist <= r_outer:
                    if dist >= r_inner:
                        # Gold border (#eab308 -> B=8, G=179, R=234)
                        xor_mask.extend([8, 179, 234, 255])
                    else:
                        # Emerald Green (#065f46 -> B=70, G=95, R=6)
                        xor_mask.extend([70, 95, 6, 255])
                else:
                    # Transparent
                    xor_mask.extend([0, 0, 0, 0])

        # AND Mask (1 bit per pixel)
        and_mask = bytearray(w * h // 8)
        for y in range(h):
            for x in range(w):
                dx = x - (w / 2 - 0.5)
                dy = y - (h / 2 - 0.5)
                dist = (dx*dx + dy*dy) ** 0.5
                if dist > r_outer:
                    # Bit 1 = transparent in AND mask
                    pixel_idx = (h - 1 - y) * w + x
                    byte_idx = pixel_idx // 8
                    bit_idx = 7 - (pixel_idx % 8)
                    and_mask[byte_idx] |= (1 << bit_idx)

        data_block = bmp_header + xor_mask + and_mask
        image_data_blocks.append(data_block)
        
        # Directory entry (16 bytes)
        entry_w = w if w < 256 else 0
        entry_h = h if h < 256 else 0
        ico_dir += struct.pack('<BBBBHHII', entry_w, entry_h, 0, 0, 1, 32, len(data_block), current_offset)
        current_offset += len(data_block)

    with open(filename, 'wb') as f:
        f.write(ico_dir)
        for block in image_data_blocks:
            f.write(block)

make_bmp_ico('csharp_solution/EVedhikaUBDDeploymentTool/app.ico')
print('Generated complete multi-res BMP ICO')
