import math

# Create a clean 256x256 PNG without any external dependencies using raw PNG format or PPM -> convert
# Or generate PPM (P6) which convert can read natively with zero delegates!

width = 256
height = 256

ppm_header = f"P6\n{width} {height}\n255\n".encode('ascii')
ppm_data = bytearray()

for y in range(height):
    for x in range(width):
        dx = x - 127.5
        dy = y - 127.5
        dist = math.sqrt(dx*dx + dy*dy)
        
        if dist <= 110:
            if dist >= 95:
                # Gold ring (#eab308)
                ppm_data.extend([234, 179, 8])
            elif 30 <= x <= 226 and 110 <= y <= 146:
                # White 'EV' bar center
                ppm_data.extend([255, 255, 255])
            else:
                # Emerald Green (#065f46)
                ppm_data.extend([6, 95, 70])
        else:
            # Dark navy background (#0f172a)
            ppm_data.extend([15, 23, 42])

with open('icon_input.ppm', 'wb') as f:
    f.write(ppm_header + ppm_data)

print("PPM generated")
