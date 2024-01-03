function getSignedAngle(v1, v2, axis) {
    let s = v1.clone().cross(v2);
    let c = v1.clone().dot(v2);
    let a = Math.atan2(s.length(), c);
    if (!s.clone().normalize().equals(axis)) {
        a *= -1;
    }
    return a;
}

export {getSignedAngle}