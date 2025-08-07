import subprocess
import os
from core.asm_parsing.filter_asm import filter_asm
from core.asm_parsing.mapper import map_asm

def generate_gcc_output_file(container_name, gcc_args, container_output_path, host_output_path):
    # Build and run command inside container
    cmd = ["docker", "exec", "--user", "nobody", container_name, "gcc"] + gcc_args + ["-o", container_output_path]
    result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)

    # Copy result from container to host
    subprocess.run(["docker", "cp", f"{container_name}:{container_output_path}", host_output_path], check=True)

    return host_output_path, result.stderr.decode()

def read_file(file_path):
    with open(file_path, 'r') as file:
        return file.read()

def get_preprocessed(container_name, tempdir):
    pre_path, _ = generate_gcc_output_file(
        container_name,
        gcc_args=["-E", "/home/source.c"],
        container_output_path="/tmp/source.i",
        host_output_path=os.path.join(tempdir, "source.io")
    )

    return read_file(pre_path)

def compile_asm_file(container_name, tempdir, tag, extra_flags):
    base = f"source_{tag}"
    source_file = "/home/source.c"
    container_out = f"/tmp/{base}.s"
    container_dbg_out = f"/tmp/{base}_dbg.s"
    host_out = os.path.join(tempdir, f"{base}.s")
    host_dbg_out = os.path.join(tempdir, f"{base}_dbg.s")

    # Get pure ASM file
    asm_path, stderr_output = generate_gcc_output_file(
        container_name,
        gcc_args=["-S"] + extra_flags + [source_file],
        container_output_path=container_out,
        host_output_path=host_out
    )

    # Get ASM with debug metadata
    asm_dbg_path, _ = generate_gcc_output_file(
        container_name,
        gcc_args=["-S", "-fverbose-asm"] + extra_flags + [source_file],
        container_output_path=container_dbg_out,
        host_output_path=host_dbg_out
    )

    # Map asm to lines of C code
    asm_line_mapping = map_asm(asm_dbg_path, asm_path)

    return read_file(asm_path), asm_line_mapping, stderr_output

def get_asm_files(container_name, tempdir):
    """Returns a list of (asm_contents, line_mapping) tuples for base, O1, O2, O3, and a warning string for base."""
    variants = [
        ("base", ["-Wall"]),   # base
        ("O1", ["-O1"]),
        ("O2", ["-O2"]),
        ("O3", ["-O3"])
    ]

    asm_files = []
    line_mappings = []
    compile_warnings = ""

    for i, (tag, flags) in enumerate(variants):
        asm, mapping, warnings = compile_asm_file(container_name, tempdir, tag, flags)
        asm_files.append(asm)
        print(f'Mapping {i}: {mapping}') # DEBUG ***
        line_mappings.append(mapping)
        if i == 0:  # Only store warnings from base file
            compile_warnings = warnings

    return asm_files, line_mappings, compile_warnings
