pub enum ERegValue<'a> {
    Str(&'a str),
    U32(u32),
    U64(u64),
    Bool(bool),
}
