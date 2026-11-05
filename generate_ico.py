import struct
import math

def create_circle_png(width, height):
    # Generates a PNG bytearray using pure Python struct and zlib
    import zlib
    
    # Render a high quality 32-bit RGBA image
    pixels = bytearray()
    
    # Colors: Dark navy background #0F172A, Emerald gradient #10B981 to #059669, Amber bolt #F59E0B
    cx, cy = width / 2.0, height / 2.0
    radius = min(width, height) / 2.0 - 1.0
    
    for y in range(height):
        pixels.append(0) # PNG filter byte for each scanline
        for x in range(width):
            dx = x - cx
            dy = y - cy
            dist = math.sqrt(dx*dx + dy*dy)
            
            # Rounded shield / emblem boundary
            if dist <= radius:
                # Gradient fill from Emerald Green top-left to Cyan bottom-right
                t = (x + y) / float(width + height)
                r = int(16 * (1 - t) + 6 * t)     # #10B981 -> #06B6D4
                g = int(185 * (1 - t) + 182 * t)
                b = int(129 * (1 - t) + 212 * t)
                a = 255
                
                # Draw a central golden lightning bolt / 'E' symbol
                # Bolt shape approximate
                nx = (x - cx) / radius
                ny = (y - cy) / radius
                
                # Central Gold Emblem condition
                if (-0.3 <= nx <= 0.3 and -0.6 <= ny <= 0.6):
                    # Gold #F59E0B
                    r, g, b = 245, 158, 11
                elif (-0.5 <= nx <= 0.5 and -0.15 <= ny <= 0.15):
                    r, g, b = 245, 158, 11
                    
                # Smooth antialiasing on border
                if dist > radius - 1.5:
                    alpha_factor = (radius - dist) / 1.5
                    a = int(255 * max(0.0, min(1.0, alpha_factor)))
            else:
                r, g, b, a = 0, 0, 0, 0
                
            pixels.extend([r, g, b, a])

    # Construct standard PNG chunk
    def make_chunk(chunk_type, data):
        content = chunk_type + data
        crc = zlib.crc32(content) & 0xFFFFFFFF
        return struct.pack('>I', len(data)) + content + struct.pack('>I', crc)

    header = b'\x89PNG\r\n\x1a\n'
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    ihdr = make_chunk(b'IHDR', ihdr_data)
    
    compressed_data = zlib.compress(bytes(pixels), 9)
    idat = make_chunk(b'IDAT', compressed_data)
    iend = make_chunk(b'IEND', b'')
    
    return header + ihdr + idat + iend

sizes = [256, 128, 64, 48, 32, 16]
png_buffers = [create_circle_png(s, s) for s in sizes]

# Build ICO File Header
num_images = len(sizes)
ico_header = struct.pack('<HHH', 0, 1, num_images)

directory = bytearray()
offset = 6 + (num_images * 16)

for i, s in enumerate(sizes):
    data = png_buffers[i]
    w = 0 if s == 256 else s
    h = 0 if s == 256 else s
    size_bytes = len(data)
    
    # 16-byte Directory Entry
    entry = struct.pack('<BBBBHHII', w, h, 0, 0, 1, 32, size_bytes, offset)
    directory.extend(entry)
    offset += size_bytes

full_ico = bytes(ico_header) + bytes(directory) + b''.join(png_buffers)

with open('csharp_solution/EVedhikaUBDDeploymentTool/app.ico', 'wb') as f:
    f.write(full_ico)

with open('public/app.ico', 'wb') as f:
    f.write(full_ico)

with open('public/favicon.ico', 'wb') as f:
    f.write(full_ico)

print(f"Generated crisp multi-resolution app.ico ({len(full_ico)} bytes).")
