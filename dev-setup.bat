call sfdx force:org:create -v devhub -a sat-dev -f config/project-scratch-def.json -d 30 -s
call sfdx force:source:push -u sat-dev
call sfdx force:user:permset:assign -u sat-dev -n SA_Administrator
call sfdx force:apex:execute -u sat-dev -f scripts/apex/set-user-role.apex
call sfdx force:data:bulk:upsert -u sat-dev -s Drug__c -f data\drugs.csv -i API_Name__c -w 5
call sfdx force:data:bulk:upsert -u sat-dev -s Account -f data\accounts.csv -i Id -w 5
call sfdx force:data:bulk:upsert -u sat-dev -s Case -f data\cases.csv -i Id -w 5
call sfdx force:org:open -u sat-dev