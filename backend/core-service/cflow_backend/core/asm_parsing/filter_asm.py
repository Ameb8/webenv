def filter_asm(asm_path):
    remove_trailing_metadata(asm_path)
    remove_call_frame_info(asm_path)

def remove_trailing_metadata(asm_path):
    with open(asm_path, 'r') as file:
        lines = file.readlines()

    # Start from the end and move backward
    for i in range(len(lines) - 1, -1, -1):
        if lines[i].lstrip().startswith('.LFE'):
            # Found the line — keep everything before it
            lines = lines[:i]
            break

    # Write the trimmed lines back to the file
    with open(asm_path, 'w') as file:
        file.writelines(lines)

def remove_call_frame_info(asm_path):
    with open(asm_path, 'r') as file:
        lines = file.readlines()

    # Filter out lines containing '.cfi_'
    filtered_lines = [line for line in lines if '.cfi_' not in line]

    with open(asm_path, 'w') as file:
        file.writelines(filtered_lines)

def test_filter():
    asm_path = '/Users/pattycrowder/cflow_test/basic_math.s'
    filter_asm(asm_path)
