import re
with open("setup.sql") as setup_sql:
    with open("destroy.sql","w") as destroy_sql:
        for line in setup_sql:
            result = re.search("create table ([a-zA-Z_]+)",line)
            try:
                name=result.group(1)
                destroy_sql.write("drop table if exists "+name+" cascade;\n")
            except:
                pass
        

