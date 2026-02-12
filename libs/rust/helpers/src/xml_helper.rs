use quick_xml::se::Serializer;
use serde::Serialize;

pub fn to_pretty_xml<T: Serialize>(value: &T) -> anyhow::Result<String> {
    let mut output = String::new();

    let mut serializer = Serializer::new(&mut output);
    serializer.indent(' ', 4);

    value.serialize(serializer)?;

    Ok(output)
}
