import re
with open("destroy.sql","w") as destroy_sql:
    for fname_setup in ["setup.sql","setup_postmaterias.sql"]:
        with open(fname_setup) as setup_sql:
            for line in setup_sql:
                result = re.search("create table ([a-zA-Z_]+)",line)
                try:
                    name=result.group(1)
                    destroy_sql.write("drop table if exists "+name+" cascade;\n")
                except:
                    pass
        

