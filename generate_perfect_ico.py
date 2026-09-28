import struct

def make_perfect_win32_ico(filename):
    # Standard sizes: 16x16, 32x32, 48x48
    sizes = [16, 32, 48]
    
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
        row_xor_bytes = w * 4 # 32-bit bpp is already DWORD aligned per row
        xor_data = bytearray()
        
        for y in range(h - 1, -1, -1): # Bottom-up
            for x in range(w):
                dx = x - (w / 2.0 - 0.5)
                dy = y - (h / 2.0 - 0.5)
                dist = (dx*dx + dy*dy) ** 0.5
                r_outer = w * 0.46
                r_inner = w * 0.38
                
                if dist <= r_outer:
                    if dist >= r_inner:
                        # Gold ring (B, G, R, A)
                        xor_data.extend([8, 179, 234, 255])
                    else:
                        # Emerald Green fill
                        xor_data.extend([70, 95, 6, 255])
                else:
                    # Transparent
                    xor_data.extend([0, 0, 0, 0])
        
        # AND Mask: 1 bit per pixel.
        # CRITICAL: Each row MUST be padded to DWORD (4 bytes) boundary!
        unpadded_row_bytes = (w + 7) // 8
        padded_row_bytes = ((unpadded_row_bytes + 3) // 4) * 4 # DWORD aligned
        
        and_data = bytearray()
        for y in range(h - 1, -1, -1): # Bottom-up
            row_bits = bytearray(padded_row_bytes)
            for x in range(w):
                dx = x - (w / 2.0 - 0.5)
                dy = y - (h / 2.0 - 0.5)
                dist = (dx*dx + dy*dy) ** 0.5
                if dist > r_outer:
                    # Bit 1 = transparent
                    byte_idx = x // 8
                    bit_idx = 7 - (x % 8)
                    row_bits[byte_idx] |= (1 << bit_idx)
            and_data.extend(row_bits)
            
        xor_size = len(xor_data)
        and_size = len(and_data)
        
        # BITMAPINFOHEADER (40 bytes)
        # Note: Height in BITMAPINFOHEADER for ICO is h * 2 (XOR + AND)
        bih = struct.pack('<IIIHHIIIIII', 40, w, h * 2, 1, bpp, 0, xor_size + and_size, 0, 0, 0, 0)
        
        block = bih + xor_data + and_data
        data_blocks.append(block)
        
        entry_w = w if w < 256 else 0
        entry_h = h if h < 256 else 0
        
        # Directory Entry (16 bytes)
        entry = struct.pack('<BBBBHHII', entry_w, entry_h, 0, 0, 1, bpp, len(block), offset)
        entries.append(entry)
        offset += len(block)
        
    with open(filename, 'wb') as f:
        f.write(ico_directory)
        for e in entries:
            f.write(e)
        for b in data_blocks:
            f.write(b)

make_perfect_win32_ico('csharp_solution/EVedhikaUBDDeploymentTool/app.ico')
print('Generated perfectly aligned Win32 ICO file')
