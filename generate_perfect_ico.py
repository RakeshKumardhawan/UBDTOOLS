import struct

def make_perfect_win32_ico(filename):
    # Standard sizes: 16x16, 32x32, 48x48, 256x256
    sizes = [16, 32, 48, 256]
    
    ico_directory = bytearray()
    ico_directory += struct.pack('<HHH', 0, 1, len(sizes)) # Reserved, Type=1(ICO), Count
    
    entries = []
    data_blocks = []
    
    offset = 6 + (16 * len(sizes))
    
    for size in sizes:
        w = size
        h = size
        bpp = 32
        
        # XOR Mask: 32bpp BGRA (w * 4 bytes per row)
        xor_data = bytearray()
        
        for y in range(h - 1, -1, -1): # Bottom-up
            for x in range(w):
                dx = x - (w / 2.0 - 0.5)
                dy = y - (h / 2.0 - 0.5)
                dist = (dx*dx + dy*dy) ** 0.5
                
                # Colors
                gold = [8, 179, 234, 255] # B, G, R, A
                bg_emerald = [70, 95, 6, 255]
                text_white = [255, 255, 255, 255]
                trans = [0, 0, 0, 0]
                
                # Outer ring
                r_outer = w * 0.48
                r_inner = w * 0.40
                
                if dist <= r_outer and dist >= r_inner:
                    xor_data.extend(gold)
                elif dist < r_inner:
                    # Draw Shield
                    # Relative coordinates -0.5 to 0.5
                    rx = dx / w
                    ry = dy / h
                    
                    # Shield shape logic
                    is_shield = False
                    if ry > -0.3 and ry < 0.2:
                        if abs(rx) < 0.25:
                            is_shield = True
                    elif ry >= 0.2 and ry < 0.4:
                        # bottom point
                        if abs(rx) < (0.4 - ry) * 1.25:
                            is_shield = True
                    elif ry <= -0.3 and ry > -0.4:
                        # top curve
                        if abs(rx) < 0.25:
                            is_shield = True
                    
                    if is_shield:
                        # Draw "EV" inside shield
                        is_e = False
                        is_v = False
                        
                        # E
                        if rx > -0.18 and rx < -0.05:
                            if ry > -0.2 and ry < 0.2:
                                # Vertical bar
                                if rx < -0.13: is_e = True
                                # Horizontal bars
                                if abs(ry) < 0.03: is_e = True
                                if abs(ry - 0.17) < 0.03: is_e = True
                                if abs(ry + 0.17) < 0.03: is_e = True
                        
                        # V
                        if rx > 0.05 and rx < 0.18:
                            if ry > -0.28 and ry < 0.2:
                                # Two diagonal bars
                                if abs(rx - 0.12 + ry*0.3) < 0.04: is_v = True
                                if abs(rx - 0.12 - ry*0.3) < 0.04: is_v = True

                        if is_e or is_v:
                            xor_data.extend(text_white)
                        else:
                            xor_data.extend(bg_emerald)
                    else:
                        xor_data.extend(bg_emerald)
                else:
                    xor_data.extend(trans)

        # AND Mask: 1 bit per pixel
        unpadded_row_bytes = (w + 7) // 8
        padded_row_bytes = ((unpadded_row_bytes + 3) // 4) * 4
        
        and_data = bytearray()
        for y in range(h - 1, -1, -1): # Bottom-up
            row_bits = bytearray(padded_row_bytes)
            for x in range(w):
                dx = x - (w / 2.0 - 0.5)
                dy = y - (h / 2.0 - 0.5)
                dist = (dx*dx + dy*dy) ** 0.5
                if dist > r_outer:
                    byte_idx = x // 8
                    bit_idx = 7 - (x % 8)
                    row_bits[byte_idx] |= (1 << bit_idx)
            and_data.extend(row_bits)

        bih = struct.pack('<IIIHHIIIIII', 40, w, h * 2, 1, bpp, 0, len(xor_data) + len(and_data), 0, 0, 0, 0)
        block = bih + xor_data + and_data
        data_blocks.append(block)
        
        entry_w = w if w < 256 else 0
        entry_h = h if h < 256 else 0
        entry = struct.pack('<BBBBHHII', entry_w, entry_h, 0, 0, 1, bpp, len(block), offset)
        entries.append(entry)
        offset += len(block)
        
    with open(filename, 'wb') as f:
        f.write(ico_directory)
        for e in entries: f.write(e)
        for b in data_blocks: f.write(b)

make_perfect_win32_ico('csharp_solution/EVedhikaUBDDeploymentTool/app.ico')
print("Generated perfectly aligned Win32 ICO file with E-VEDHIKA Branding")
