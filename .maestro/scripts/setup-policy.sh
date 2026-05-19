#!/bin/bash
# .maestro/scripts/setup-policy.sh agreed|not-agreed
# user 9 의 정책 동의 상태를 토글.

set -e
STATE="${1:-not-agreed}"
case "$STATE" in
  agreed)
    SQL="UPDATE user SET community_policy_agreed_version='v1.0', community_policy_agreed_at=NOW() WHERE id=9;"
    ;;
  not-agreed)
    SQL="UPDATE user SET community_policy_agreed_version=NULL, community_policy_agreed_at=NULL WHERE id=9;"
    ;;
  *)
    echo "Usage: $0 agreed|not-agreed" >&2
    exit 1
    ;;
esac
MYSQL_PWD='1234' mysql -h 127.0.0.1 -P 3306 -u admin -D keeper -e "$SQL"
echo "✓ user 9 policy: $STATE"
