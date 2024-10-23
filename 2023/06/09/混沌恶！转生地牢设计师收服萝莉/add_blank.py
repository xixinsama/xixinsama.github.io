input_file = 'D:\\pyProj\\newpages\\source\\_posts\\混沌恶！转生地牢设计师收服萝莉\\ONmd.md'
output_file = 'D:\\pyProj\\newpages\\source\\_posts\\混沌恶！转生地牢设计师收服萝莉\\output_mdfile.md'

with open(input_file, 'r', encoding='utf-8') as file:
    lines = file.readlines()

# 在每行末尾添加两个空格
with open(output_file, 'w', encoding='utf-8') as file:
    for line in lines:
        # 如果是标题行，不添加空格
        # 如果是空行，不添加空格
        if line.startswith('#') or line.startswith('\n'):
            file.write(line)
        else:
            file.write(line.rstrip() + '  \n')

print('Done!')