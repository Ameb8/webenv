import re
from collections import defaultdict


def get_line_num(line):
    match = re.search(r":(\d+):", line)
    if match:
        return int(match.group(1))
    return -1

def map_asm(asm_lines_path, asm_pure_path):
    """
    Get lines for mapping C to assembly code
    asm_lines_path generated with: 'gcc -S -fverbose-asm source.c -o source_O2.s'

    Parameters:
        asm_lines_path (str): Path to assembly file with C line labels
        asm_pure_path (str): Path to pure assembly file
    Returns:
        dict: A dictionary mapping C line numbers to assembly line numbers
              Entries: {C line number, [list of ASM line numbers]}
    """
    line_map = defaultdict(list)

    with open(asm_lines_path, 'r') as asm_lines, open(asm_pure_path, 'r') as asm_pure:
        iter1 = iter(asm_lines)
        iter2 = iter(asm_pure)
        c_line = -1
        line_num = 1
        line_dbg_num = 1

        try:
            line1 = next(iter1)
            line2 = next(iter2)

            # Advanced to mutual starting point
            while not line1.strip().startswith('.text'):
                line1 = next(iter1)
                line_dbg_num += 1
            while not line2.strip().startswith('.text'):
                line2 = next(iter2)
                line_num += 1

            while True:
                # Label for C line found, skip and update line num
                if line1.strip().startswith("# /home/source.c"):
                    c_line = get_line_num(line1)

                    # Skip line in asm_lines
                    line1 = next(iter1)
                    line_dbg_num += 1
                    continue

                # Header reached, line association ended
                if line1.strip().startswith('.L'):
                    c_line = -1

                # Matching lines found, add to line_map
                if line1.strip().startswith(line2.strip()) and c_line > 0:
                    line_map[c_line].append(line_num)
                    #print(f'Line match:\n{line1}\n{line2}')


                # get next lines
                line1 = next(iter1)
                line2 = next(iter2)
                line_num += 1
                line_dbg_num += 1

        # One of the files has ended
        except StopIteration:
            pass

    return line_map




