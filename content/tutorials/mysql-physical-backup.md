+++
date = 2020-01-30T09:00:00Z
lastmod = 2020-01-30T09:00:00Z
author = "Oli"
title = "MySQL Physical backup using XtraBackup"
subtitle = ""
feature = ""
tags = ["DB", "Backups"]
summary = ""
[toc]
  enable = true
+++


&nbsp; 


Databases are and always will be the most critical applications when it comes to
maintenance, durability, uptime and smooth running of the businesses. 

DBs, being the backbone of all of the operations going on, need to be resilient, fault tolerant, and
therefore they demand special attention and vigilance from the administrators.

One of the many tactics to safegaurd data, recover from data losses is taking periodic
backups because one doesn't know when something unfortunate will happen.

Backups strategies vary from business to business and organisations to organisations 
like Transactional log based backups, Mirroring, Physical backups, etc.

In this article, we'll see how to take physical backup of MySQL/Percona DB.


&nbsp; 

## What the heck is physical backup?

Physical backup means backing-up the whole data directory/files either in the
current state regardless of whether DB is running (HOT backup) or it’s stopped
(COLD backup). In a physical backup, not only log files but all of the data like
log files, control files, executables, etc present in the directory are backed
up.

And, XtraBackup is a physical (and HOT) backup utility maintained by Percona
Community itself which makes physically backing up your MySQL DB a seamless and
wonderful experience.



**Benefits of Xtrabackup:**


- First of all, It’s all free, and maintained by Percona community itself
- By default, a HOT backup utility means no locking on tables (InnoDB only)
  during backup. Yeah! Yeah! I know `--single-transaction` of mysqldump provides
  that too.
- Allows FULL as well as subsequent incremental backups.
- Scales well for Terabytes size of data
- Blazingly fast backup time for large databases as compared to traditional log
  based strategy. For our DB (> 100 GB and ~250 tables) it’s 18 mins vs 72 mins
- Amazing restore time too. For me, due to de-compression and untar it’s 35 mins
  vs 80 mins
- Creation of Slave DB for replication and read-only is breeze with XtraBackup
- Allows moving tables between DBs on-line.
- Since, it backs up the whole directory it’s easier to restore and go back to
  any previous state

**Cons:**

- Requires read lock for non-InnoDB tables
- Backup fails when there are Too many open files
- If the `xtrabackup_logfile` > 4GB, the `--prepare` step will fail on 32-bit versions of xtrabackup
- Although it allows partial backups, but restoring them require extra care

So, that being said, in layman terms, it will backup all of the content inside
`/var/lib/mysql` (default datadir for mysql) directory and you can stream it to S3
or any storage provider directly for safe keeping it.


&nbsp;

## Let’s backup

So let’s start with our first full physical backup, this will also be the base
for our subsequent incremental backups. Full backup using XtraBackup is
completely straightforward and is done in a single command.


### Full backup
Now, we’ll perform a full physical backup, zip it and safely store it in S3.

```bash
# Note: Complete script is available at: https://github.com/shubhamoli/
# for complete reference on options used
# see: https://www.percona.com/doc/percona-xtrabackup/8.0/xtrabackup_bin/xbk_option_reference.html
# Don't forget to replace DB_USER, DB_PASS, BACKUP_DIR with actual values.
$ xtrabackup  \
    --user=$DB_USER \
    --password=$DB_PASS \
    --backup \
    --history \
    --compress \
    --compress-threads=2 \
    --target-dir=$BACKUP_DIR/FULL

# Since we have already compressed our backup using --compress option, we just have to tar it
$ tar -cf \
      --no-auto-compress \
      db-backup.tar.gz \
      db-backup-2020-01-26

# Now we will send this backup to S3
$ aws s3 cp \
      db-backup-2020-01-26.tar.gz \
      s3://<bucket>/db-backup-2020-01-26.tar.gz

# That's all!.....You DB is now backed-up
```


### Incremental Backup

Let me inform you, unlike Full backups, incremental backups are not that
straightforward.

Then why incremental backups?…. Okay!, you might not want to restore a DB which
was backed up 10-12 hrs back and which directly means a loss of 10-12 hours of
critical data in case of any unfortunate disaster.

If this sounds reasonable to you, then let’s see how we can take incremental
backups.

As we know, Incremental backup requires FULL backup or previous incremental
backup to start with. So, for first incremental the base will be latest FULL
backup and for next nth incremental backups base will be n-1th incremental
backup. You can take as many incremental backup as you want, depending upon loss
of data your business can sustain, between a FULL backup cycle.


``` bash
# First incremental 
# it's base will be last full backup
$ xtrabackup --backup \
       --target-dir=/data/backups/inc1 \
       --incremental-basedir=/data/backups/FULL

# further incremental backups
# the base will be previous incremental backup
$ xtrabackup --backup \
       --target-dir=/data/backups/incN \
       --incremental-basedir=/data/backups/inc(N-1)

# zip it and send it to S3 (see above)
```

&nbsp;

**Setup a cron job to auto backup DB**

You can install a cronjob to periodically take FULL and Incremental backups and
safely transfer them to Cloud storage like S3. One such sample crontab entry is
shown below

```bash
# crontab

# full backup at 5 in the morning (or time of least traffic)
0 5 * * * db_backup.sh full

# incremental backups every 30th minute (or can be more granular)
*/30 * * * * db_backup.sh incremental
```

&nbsp;

**Hey! wait….what about restore?**

Either try to learn yourself or just sit calmly, realising that your Data is now
automatically backed up and wait for my next article on restoring both FULL and
Incremental backups.

Alternatively, keep an eye on my GitHub Account where I’ll be uploading the
scripts soon.


## Conclusion

If you are a DBA thinking about backing up your database or an engineer who is
already frustrated over time taken by your existing backup strategy due to
ever-growing Database size then IMO it’s right time to switch to Physical and
HOT backup utility and enjoy your weekends like a Champ!.

Xtrabackup is a free and open-source tool maintained by Percona community which
facilitates physical and HOT backups, it scales and works amazingly well with large databases of terabytes of size.

&nbsp;


#LearnIt #TillThenHappyCoding

