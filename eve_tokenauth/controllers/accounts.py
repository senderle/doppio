import bcrypt


def hash_passwords(items):
    for item in items:
        item['password'] = bcrypt.hashpw(item['password'].encode('utf8'), bcrypt.gensalt())
        pass
    return items
