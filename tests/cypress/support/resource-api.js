function createResourceAs(role, resourcePath, body) {
  return cy.requestAs(role, "POST", resourcePath, body);
}

function updateResourceAs(role, resourcePath, id, body) {
  return cy.requestAs(role, "PUT", `${resourcePath}/${id}`, body);
}

function deleteResourceAs(role, resourcePath, id) {
  return cy.requestAs(role, "DELETE", `${resourcePath}/${id}`);
}

function listResourcesAs(role, resourcePath, query = "") {
  return cy.requestAs(role, "GET", `${resourcePath}${query}`);
}

function getResourceAs(role, resourcePath, id) {
  return cy.requestAs(role, "GET", `${resourcePath}/${id}`);
}

function expectSingleResourceLookup(role, resourcePath, id) {
  return listResourcesAs(role, resourcePath).then((listResponse) =>
    getResourceAs(role, resourcePath, id).then((getResponse) => {
      expect(listResponse.status).to.equal(200);
      expect(listResponse.body.data).to.have.length(1);
      expect(getResponse.status).to.equal(200);
      expect(getResponse.body.data.id).to.equal(id);

      return {
        getResponse,
        listResponse
      };
    })
  );
}

module.exports = {
  createResourceAs,
  deleteResourceAs,
  expectSingleResourceLookup,
  getResourceAs,
  listResourcesAs,
  updateResourceAs
};
